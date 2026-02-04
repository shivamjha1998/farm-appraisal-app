import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import random
import asyncio

class YahooScraperService:
    def __init__(self):
        self.base_url = "https://auctions.yahoo.co.jp/closedsearch/closedsearch"

    async def search_equipment(self, make: str, model: str, equipment_type: str = "") -> List[Dict[str, Any]]:
        query_parts = [make]
        if equipment_type:
            query_parts.append(equipment_type)
        query_parts.append(model)
        
        query = " ".join(query_parts).strip()
        
        # Params for Closed Search
        params = {
            "p": query,
            "va": query,
            "b": 1,
            "n": 50
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://auctions.yahoo.co.jp/"
        }

        print(f"Scraping Yahoo Sold Listings for: {query}")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                # Add a small random delay to be polite
                await asyncio.sleep(random.uniform(0.5, 1.5))
                
                response = await client.get(self.base_url, params=params, headers=headers)
                
                if response.status_code == 404:
                    print(f"Info: No results found for '{query}' (Yahoo returned 404)")
                    return []
                
                if response.status_code != 200:
                    print(f"Scraper Warning: Received status {response.status_code}")
                    return []
                
                return self._parse_results(response.text)
            except Exception as e:
                print(f"Scraping error: {e}")
                return []

    def _parse_results(self, html_content: str) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(html_content, 'html.parser')
        results = []
        
        # Select items. Yahoo Closed Search often uses the same .Product structure
        items = soup.select(".Product") 
        
        for item in items:
            try:
                title_el = item.select_one(".Product__titleLink")
                price_el = item.select_one(".Product__priceValue")
                image_el = item.select_one(".Product__imageData")
                time_el = item.select_one(".Product__time")
                
                if title_el and price_el:
                    title = title_el.text.strip()
                    url = title_el.get('href')
                    
                    # Clean price text
                    price_text = price_el.text.strip().replace('円', '').replace(',', '')
                    price = float(price_text) if price_text.isdigit() else 0.0
                    
                    image_url = image_el.get('src') if image_el else None
                    
                    # Clean date text
                    date_str = time_el.text.strip() if time_el else None
                    
                    # Only add if price is valid
                    if price > 0:
                        results.append({
                            "title": title,
                            "price": price,
                            "currency": "JPY",
                            "url": url,
                            "image_url": image_url,
                            "date": date_str,
                            "source": "Yahoo Auctions (Sold)"
                        })
            except Exception as e:
                continue 

        return results