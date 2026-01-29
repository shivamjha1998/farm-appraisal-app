from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from src.services.gemini_service import GeminiService
from src.services.scraper_yahoo import YahooScraperService
from src.services.supabase_service import SupabaseService
import os
import statistics # Import statistics

load_dotenv()

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
gemini_service = None
scraper_service = None
supabase_service = None

@app.on_event("startup")
async def startup_event():
    global gemini_service, scraper_service, supabase_service
    if os.getenv("GEMINI_API_KEY"):
        gemini_service = GeminiService()
    else:
        print("WARNING: GEMINI_API_KEY not set. /analyze endpoint will fail.")
    scraper_service = YahooScraperService()
    supabase_service = SupabaseService()

@app.get("/")
def read_root():
    return {"message": "Farm Appraisal API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Shared Search Logic ---
async def perform_market_search(make: str, model: str, type_str: str = ""):
    """
    Shared logic to search for equipment.
    Accepts English inputs.
    """
    make_ja = make # In manual search, we assume input might be the query term
    type_ja = type_str
    
    print(f"Manual Search: Make='{make}', Model='{model}', Type='{type_str}'")
    
    market_data = None
    
    # Try Cache First
    if supabase_service:
        market_data = await supabase_service.get_cached_price(make, model)
    
    # If no cache, Scrape
    if not market_data and scraper_service:
        
        def filter_valid_results(items):
            print(f"Returning {len(items)} items.")
            return items

        # Strategy 1: Search Exact String provided
        search_query = f"{make} {model} {type_str}".strip()
        print(f"Strategy 1: Searching '{search_query}'")
        raw_data = await scraper_service.search_equipment(make, model, type_str)
        market_data = filter_valid_results(raw_data)

        # Strategy 2: Search Make + Model
        if not market_data:
            search_query = f"{make} {model}"
            print(f"Strategy 2: Searching '{search_query}'")
            raw_data = await scraper_service.search_equipment(make, model)
            market_data = filter_valid_results(raw_data)
            
        # Strategy 3: Broad Model Only
        if not market_data:
            print(f"Strategy 3: Broad Search '{model}'")
            raw_data = await scraper_service.search_equipment("", model)
            market_data = filter_valid_results(raw_data)
        
        # Cache the result
        if market_data and supabase_service:
            await supabase_service.cache_price(make, model, market_data)
            
    return market_data

# --- New Search Endpoint ---
class SearchRequest(BaseModel):
    make: str
    model: str
    type: str = ""
    year: str = ""

@app.post("/search")
async def search_equipment_manual(request: SearchRequest):
    try:
        market_data = await perform_market_search(request.make, request.model, request.type)
        
        result = {
            "make": request.make,
            "model": request.model,
            "type": request.type,
            "year_range": request.year if request.year else "Unknown",
            "confidence": 1.1,
            "market_data": market_data or []
        }

        if market_data:
            prices = [item["price"] for item in market_data if item["price"] > 0]
            if prices:
                result["price_stats"] = {
                    "min": min(prices),
                    "max": max(prices),
                    "avg": statistics.mean(prices),
                    "median": statistics.median(prices),
                    "currency": "JPY"
                }
        
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_equipment(file: UploadFile = File(...)):
    if not gemini_service:
        raise HTTPException(status_code=503, detail="Gemini Service not configured")
    
    try:
        content = await file.read()
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
             raise HTTPException(status_code=400, detail="Invalid image format.")

        # 1. Identify Equipment
        analysis_result = await gemini_service.analyze_image(content)
        
        if "error" in analysis_result and analysis_result.get("confidence", 1.0) < 0.5:
             return analysis_result

        # 2. Get Market Data using the logic inside analyze
        # Note: We keep the original rigorous logic for AI results here or we could refactor 
        # to use perform_market_search, but AI results have specific JA translations we want to use.
        
        make = analysis_result.get("make")
        model = analysis_result.get("model")
        make_ja = analysis_result.get("make_ja")
        type_ja = analysis_result.get("type_ja")
        
        market_data = None
        
        if make and model:
             # Use the shared search logic which includes caching and multiple strategies
             # Pass Japanese Make/Type if available as the primary search terms
             search_make = make_ja if make_ja else make
             search_type = type_ja if type_ja else ""
             
             print(f"Analyze: Calling perform_market_search with {search_make}, {model}, {search_type}")
             market_data = await perform_market_search(search_make, model, search_type)
        
        if market_data:
            analysis_result["market_data"] = market_data
            prices = [item["price"] for item in market_data if item["price"] > 0]
            if prices:
                analysis_result["price_stats"] = {
                    "min": min(prices),
                    "max": max(prices),
                    "avg": statistics.mean(prices),
                    "median": statistics.median(prices),
                    "currency": "JPY"
                }
        
        return analysis_result
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))