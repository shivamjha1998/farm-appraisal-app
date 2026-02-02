from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import statistics

# Services
from src.services.gemini_service import GeminiService
from src.services.scraper_yahoo import YahooScraperService
from src.services.supabase_service import SupabaseService
from src.services.verification_service import VerificationService

load_dotenv()

# --- Pydantic Models ---
class MarketDataPoint(BaseModel):
    price: float
    title: str
    url: Optional[str] = None

class PriceStats(BaseModel):
    min: float
    max: float
    avg: float
    median: float
    currency: str

class AppraisalResult(BaseModel):
    make: Optional[str] = None
    make_ja: Optional[str] = None
    model: Optional[str] = None
    type: Optional[str] = None
    year_range: Optional[str] = None
    confidence: float = 0.0
    verified: bool = False
    market_data: List[Dict[str, Any]] = []
    price_stats: Optional[PriceStats] = None
    type_ja: Optional[str] = None
    verification_warning: Optional[str] = None
    error: Optional[str] = None

# --- Dependency Injection Setup ---
class ServiceContainer:
    gemini: Optional[GeminiService] = None
    scraper: Optional[YahooScraperService] = None
    supabase: Optional[SupabaseService] = None
    verification: Optional[VerificationService] = None

services = ServiceContainer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize services
    services.gemini = GeminiService()
    services.scraper = YahooScraperService()
    services.supabase = SupabaseService()
    services.verification = VerificationService()
    yield
    # Shutdown: Clean up resources if necessary (e.g., close DB connections)
    # if services.supabase: services.supabase.close() 

# --- App Config ---
app = FastAPI(lifespan=lifespan)

# Restrict Origins in Production
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Dependency Getters ---
def get_scraper():
    if not services.scraper:
        raise HTTPException(status_code=503, detail="Scraper service unavailable")
    return services.scraper

def get_supabase():
    return services.supabase

def get_gemini():
    if not services.gemini:
        raise HTTPException(status_code=503, detail="Gemini service unavailable")
    return services.gemini

def get_verification():
    return services.verification

# --- Logic ---

async def perform_market_search(
    make: str, 
    model: str, 
    type_str: str, 
    scraper: YahooScraperService, 
    supabase: Optional[SupabaseService]
) -> List[Dict[str, Any]]:
    
    # 1. Try Cache
    if supabase:
        cached = await supabase.get_cached_price(make, model)
        if cached:
            return cached
            
    # 2. Scrape
    market_data = []
    
    # Strategy 1: Exact
    market_data = await scraper.search_equipment(make, model, type_str)
    
    # Strategy 2: Broad
    if not market_data:
        market_data = await scraper.search_equipment(make, model)

    # Strategy 3: Broad Model Only (if model is specific enough, e.g., "L2501")
    if not market_data and len(model) > 3:
        market_data = await scraper.search_equipment("", model)

    # 3. Cache Result
    if market_data and supabase:
        await supabase.cache_price(make, model, market_data)
        
    return market_data

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Farm Appraisal API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/search-prices", response_model=AppraisalResult)
async def search_prices(
    make: str = Query(..., min_length=1),
    model: str = Query("", description="Model number"),
    type: str = "",
    year: str = "",
    scraper: YahooScraperService = Depends(get_scraper),
    supabase: SupabaseService = Depends(get_supabase)
):
    try:
        market_data = await perform_market_search(make, model, type, scraper, supabase)
        
        result = AppraisalResult(
            make=make,
            model=model,
            type=type,
            year_range=year or "Unknown",
            confidence=1.0,
            market_data=market_data or []
        )

        if market_data:
            prices = [item["price"] for item in market_data if isinstance(item, dict) and item.get("price", 0) > 0]
            if prices:
                result.price_stats = PriceStats(
                    min=min(prices),
                    max=max(prices),
                    avg=statistics.mean(prices),
                    median=statistics.median(prices),
                    currency="JPY"
                )
        
        return result

    except Exception as e:
        # Log specific error internally here
        print(f"Search Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during search")

@app.post("/api/analyze-image", response_model=AppraisalResult)
async def analyze_equipment(
    file: UploadFile = File(...),
    gemini: GeminiService = Depends(get_gemini),
    verification: VerificationService = Depends(get_verification),
    scraper: YahooScraperService = Depends(get_scraper),
    supabase: SupabaseService = Depends(get_supabase)
):
    # Validate file type strictly
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/heic"]:
         raise HTTPException(status_code=400, detail="Invalid image format. Supported: JPEG, PNG, WEBP.")

    try:
        content = await file.read()
        
        # 1. Identify
        analysis_raw = await gemini.analyze_image(content)
        
        # Parse into our Pydantic model (handles defaults safely)
        # Note: Analysis raw might contain "error", handled below
        if analysis_raw.get("confidence", 0) < 0.5 or "error" in analysis_raw:
             return AppraisalResult(
                 error=analysis_raw.get("error", "Low confidence"),
                 confidence=analysis_raw.get("confidence", 0.0)
             )

        result = AppraisalResult(**analysis_raw)

        # 2. Verify
        if verification and result.make and result.model:
            v_result = await verification.verify_model_existence(result.make, result.model, result.type or "")
            result.verified = v_result.get("verified", False)

        # 3. Market Data
        if result.make and result.model:
            search_make = result.make_ja if result.make_ja else result.make
            search_type = result.type_ja if result.type_ja else ""
            
            market_data = await perform_market_search(search_make, result.model, search_type, scraper, supabase)
            result.market_data = market_data or []

            if market_data:
                prices = [item["price"] for item in market_data if item.get("price", 0) > 0]
                if prices:
                    result.price_stats = PriceStats(
                        min=min(prices),
                        max=max(prices),
                        avg=statistics.mean(prices),
                        median=statistics.median(prices),
                        currency="JPY"
                    )

        return result
        
    except Exception as e:
        print(f"Analyze Error: {e}")
        raise HTTPException(status_code=500, detail="Image analysis failed.")