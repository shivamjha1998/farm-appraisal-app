from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.services.gemini_service import GeminiService
from src.services.scraper_yahoo import YahooScraperService
from src.services.supabase_service import SupabaseService
import os

load_dotenv()

app = FastAPI()

# Allow CORS for React Native dev (Expo often runs on different ports/IPs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (lazy load or on startup)
gemini_service = None
scraper_service = None
supabase_service = None

@app.on_event("startup")
async def startup_event():
    global gemini_service, scraper_service, supabase_service
    
    # Initialize Gemini
    if os.getenv("GEMINI_API_KEY"):
        gemini_service = GeminiService()
    else:
        print("WARNING: GEMINI_API_KEY not set. /analyze endpoint will fail.")
        
    # Initialize Scraper
    scraper_service = YahooScraperService()
    
    # Initialize Supabase
    supabase_service = SupabaseService()

@app.get("/")
def read_root():
    return {"message": "Farm Appraisal API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_equipment(file: UploadFile = File(...)):
    if not gemini_service:
        raise HTTPException(status_code=503, detail="Gemini Service not configured (Missing API Key)")
    
    try:
        content = await file.read()
        # Basic validation
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
             raise HTTPException(status_code=400, detail="Invalid image format. Use JPEG, PNG, or WebP.")

        # 1. Identify Equipment with AI
        analysis_result = await gemini_service.analyze_image(content)
        
        # Check for errors in analysis
        if "error" in analysis_result and analysis_result.get("confidence", 1.0) < 0.5:
             # Return early if AI couldn't identify it, but still return 200 with error info
             return analysis_result

        # 2. Get Market Data (Cache -> Scrape)
        make = analysis_result.get("make")
        model = analysis_result.get("model")
        make_ja = analysis_result.get("make_ja")
        type_ja = analysis_result.get("type_ja")
        
        print(f"AI Identified: Make='{make}' (JA: {make_ja}), Model='{model}'")
        
        market_data = None
        
        if make and model:
             # Try Cache First (using EN keys as primary ID)
             if supabase_service:
                 market_data = await supabase_service.get_cached_price(make, model)
             
             # If no cache, Scrape
             if not market_data and scraper_service:
                # Construct Query: Prefer Japanese Make + Model -> Fallback to English Make + Model
                # Note: Model is often alphanumeric so safe to keep as is.
                
                # Helper function to filter results
                def filter_valid_results(items, make_ja, make, type_ja, model):
                    # Relaxed Filter: Return everything found by the scraper's query.
                    # The user wants to see all results and filter manually by price on the frontend.
                    print(f"Returning {len(items)} items without strict filtering.")
                    return items

                # Strategy 1: Search with Japanese Make + Model + Type (Most Specific - User Requested)
                if make_ja and type_ja:
                    search_query = f"{make_ja} {model} {type_ja}"
                    print(f"Strategy 1: Searching '{search_query}'")
                    raw_data = await scraper_service.search_equipment(make_ja, model, type_ja)
                    market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)

                # Strategy 2: Search with Japanese Make + Model
                if not market_data and make_ja:
                    search_query = f"{make_ja} {model}"
                    print(f"Strategy 2: Searching '{search_query}'")
                    raw_data = await scraper_service.search_equipment(make_ja, model)
                    market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)

                # Strategy 3: English Make + Model
                if not market_data and make:
                     if make != make_ja:
                        search_query = f"{make} {model}"
                        print(f"Strategy 3: Searching '{search_query}'")
                        raw_data = await scraper_service.search_equipment(make, model)
                        market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)

                # Strategy 4: Type (JA) + Model
                if not market_data and type_ja:
                    search_query = f"{type_ja} {model}"
                    print(f"Strategy 4: Searching fallback '{search_query}'")
                    raw_data = await scraper_service.search_equipment("", model, type_ja)
                    market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)

                # Strategy 5: Broad Model Only
                if not market_data:
                    print(f"Strategy 5: Broad Search '{model}'")
                    raw_data = await scraper_service.search_equipment("", model)
                    market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)
                
                # Cache the result (using standard EN keys for consistency)
                if market_data and supabase_service:
                    await supabase_service.cache_price(make, model, market_data)
        
        if market_data:
            print(f"Found {len(market_data)} listings.")
            analysis_result["market_data"] = market_data
            
            # Calculate simple stats
            prices = [item["price"] for item in market_data if item["price"] > 0]
            if prices:
                import statistics
                analysis_result["price_stats"] = {
                    "min": min(prices),
                    "max": max(prices),
                    "avg": statistics.mean(prices),
                    "median": statistics.median(prices),

                    "currency": "JPY"
                }
        else:
            print("No market data found.")
        
        return analysis_result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
