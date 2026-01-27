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
                    if not items: return []
                    valid_items = []
                    
                    # Normalize model for comparison
                    model_clean = model.lower().replace(" ", "").replace("-", "")
                    model_loose = model.lower()
                    
                    # Extract numeric part for fallback (e.g., "GL21" -> "21")
                    import re
                    model_numbers = re.findall(r'\d+', model)
                    model_numeric = "".join(model_numbers) if model_numbers else ""
                    
                    # Keywords
                    make_keywords = [k.lower() for k in [make_ja, make] if k]
                    type_keywords = [k.lower() for k in [type_ja, analysis_result.get("type")] if k]
                    
                    print(f"Filtering with: Model='{model}' (Num: '{model_numeric}'), Make={make_keywords}, Type={type_keywords}")

                    for item in items:
                        title_lower = item["title"].lower()
                        title_clean = title_lower.replace(" ", "").replace("-", "")
                        
                        # Check 1: Brand (Make) - STRICT
                        has_make = any(k in title_lower for k in make_keywords)
                        
                        # Check 2: Type - STRICT
                        has_type = any(k in title_lower for k in type_keywords)
                        
                        # Check 3: Model - FALBACK ALLOWED
                        # Full match
                        has_full_model = (model_loose in title_lower) or (model_clean in title_clean)
                        # Numeric fallback (only if numbers exist and are specific enough, e.g. length > 1)
                        has_numeric_model = False
                        if model_numeric and len(model_numeric) > 1:
                             # Ensure the number exists as a distinct token or part of a token? 
                             # Simple check: is the number sequence in the string?
                             has_numeric_model = model_numeric in title_clean
                        
                        has_model_match = has_full_model or has_numeric_model
                        
                        # Combined Logic: Must have Brand AND Type AND (Model or Numbers)
                        if has_make and has_type and has_model_match:
                             valid_items.append(item)
                            
                    print(f"Filtered {len(items)} -> {len(valid_items)}")
                    return valid_items

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
