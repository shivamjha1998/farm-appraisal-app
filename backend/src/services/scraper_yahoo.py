import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any


class YahooScraperService:
    def __init__(self):
        # Base URL for Yahoo Auctions (using a generic search)
        # Note: Yahoo Auctions Japan is auctions.yahoo.co.jp. 
        # Assuming the user meant Yahoo Auctions Japan given "Make/Model" context which is common for tractors export.
        # If it's a different Yahoo Auction, we'd adjust.
        self.base_url = "https://auctions.yahoo.co.jp/search/search"

    async def search_equipment(self, make: str, model: str, equipment_type: str = "") -> List[Dict[str, Any]]:
        # Construct query with make, optional type, and model
        query_parts = [make]
        if equipment_type:
            query_parts.append(equipment_type)
        query_parts.append(model)
        
        query = " ".join(query_parts).strip()
        
        params = {
            "p": query,
            # "va": query, # specific to some yahoo searches, might be causing issues if complex
            "exflg": 1, 
            "b": 1,     
            "n": 20     
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://auctions.yahoo.co.jp/"
        }

        print(f"Scraping Yahoo Auctions for: {query}")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(self.base_url, params=params, headers=headers)
                
                if response.status_code != 200:
                    print(f"Scraper Warning: Received status {response.status_code}, attempting to parse anyway.")
                    # return [] # Yahoo sometimes returns 404 for valid search pages?
                
                return self._parse_results(response.text)
            except Exception as e:
                print(f"Scraping error: {e}")
                return []

    def _parse_results(self, html_content: str) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(html_content, 'html.parser')
        results = []
        
        # Selectors depend heavily on Yahoo's current DOM structure.
        # These are best-guess generic selectors for a list of products.
        # Typically Yahoo Auctions uses class "Product" or similar.
        # We will look for list items in the search result container.
        
        # Note: This is brittle and requires constant maintenance.
        # Strategies: Look for 'li' with class 'Product'
        
        items = soup.select(".Product") 
        
        for item in items:
            try:
                title_el = item.select_one(".Product__titleLink")
                price_el = item.select_one(".Product__priceValue")
                image_el = item.select_one(".Product__imageData")
                
                if title_el and price_el:
                    title = title_el.text.strip()
                    url = title_el.get('href')
                    price_text = price_el.text.strip().replace('円', '').replace(',', '')
                    price = float(price_text) if price_text.isdigit() else 0.0
                    
                    image_url = image_el.get('src') if image_el else None
                    
                    results.append({
                        "title": title,
                        "price": price,
                        "currency": "JPY",
                        "url": url,
                        "image_url": image_url,
                        "source": "Yahoo Auctions"
                    })
            except Exception as e:
                continue # Skip malformed items

        return results
