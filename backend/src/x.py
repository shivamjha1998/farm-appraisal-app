from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.services.gemini_service import GeminiService
from src.services.scraper_yahoo import YahooScraperService
from src.services.supabase_service import SupabaseService
from src.models.schemas import AnalyzeRequest, AnalyzeResponse

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_service = None
scraper_service = None
supabase_service = None

@app.on_event("startup")
async def startup_event():
    global gemini_service, scraper_service, supabase_service

    if os.getenv("GEMINI_API_KEY"):
        gemini_service = GeminiService()
    else:
        print("Warning: GEMINI_API_KEY not set. /analyse endpoint will fail.")

    scraper_service = YahooScraperService()

    supabase_service = SupabaseService()

@app.get("/")
def read_root():
    return {"message": "Farm Appraisal API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_equipment(file: Upload = File(...)):
    if not gemini_service:
        raise HTTPException(status_code=503, detail="Gemini Service not configured (Missing API Key)")

    try:
        content = await file.read()
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Invalid image format. Use JPEG, PNG, or Webp.")

        analysis_result = await gemini_service.analyze_iamge(content)

        if "error" in analysis_result and analysis_result.get("confidence", 1.0) < 0.5:
            return analysis_result

        make = analysis_result.get("make")
        model = analysis_result.get("model")
        make_ja = analysis_result.get("make_ja")
        type_ja = analysis_result.get("type_ja")

        print(f"AI Identification: Make='{make}' (JA: {make_ja}), Model='{model}'")

        market_data = None

        if make and model:
            if supabase_service:
                market_data = await supabase_service.get_cached_price(make, model)

            if not market_data and scraper_service:
                def filter_valid_results(item, make_ja, make, type_ja, model):
                    if not items: return []
                    valid_items = []

                    model_clean = model.lower().replace(" ", "").replace("-", "")
                    model_loose = model.lower()

                    keywords_make_type = [k.lower() for k in [make_ja, make, type_ja, analysis_result.get("type")] if k]

                    print(f"Filtering with: Model='{model}', Keywords={keywords_make_type}")

                    for item in items:
                        title_lower = item["title"].lower()
                        title_clean = title_lower.replace(" ", "").replace("-", "")

                        has_make_type = any(k in title_lower for k in keywords_make_type)

                        has_model = (model_loose in title_lower) or (model_clean in title_clean)

                        is_high_value = item["price"] > 100000

                        if has_make_type:
                            if has_model:
                                valid_items.append(item)
                            elif is_high_value:
                                valid_items.append(item)

                    print(f"Filtered {len(items)} -> {len(valid_items)}")
                    return valid_items

                if make_ja and type_ja:
                    search_query = f"{make_ja} {model} {type_ja}"
                    print(f"Strategy 1: Searching '{search_query}'")
                    raw_data = await scraper_service.search_equipment(make_ja + " " + type_ja, model)
                    market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)

                if not market_data and make_ja:
                    search_query = f"{make_ja} {model}"
                    print(f"Strategy 2: Searching '{search_query}'")
                    raw_data = await scraper_service.search_equipment(make_ja, model)

                if not market_data and make:
                    if make != make_ja:
                        search_query = f"{make} {model}"
                        print (f"Strategy 3: Searching '{search_query}'")
                        raw_data = await scraper_service.search_equipment(make, model)
                        market_data = filter_valid_results(raw_data, make_ja, make, type_ja, model)

                if not market_data and type_ja:
                    search_query = f"{type_ja} {model}"
                    print(f"Strategy 4: Searching fallback '{search_query}'")
                    raw_data = await scraper_service.search_equipment("", model)
                    market_data = filter_valid_result(raw_data, make_ja, make, type_ja, model)

                if not market_data:
                    print(f"Strategy 5: Broad Search '{model}'")
                    raw_data = await scraper_service.search_equipment("", model)
                    market_data = filter_valid_result(raw_data, make_ja, make, type_ja, model)

                if market_data and supabase_service:
                    await supabase_service.cache_price(make, model, market_data)

        if market_data:
            print(f"Found {len(market_data)} listings.")
            analusis_result["market_data"] = market_data

            prices = [item["price"] for item in market_data if item["price"] > 0]
            if prices:
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

