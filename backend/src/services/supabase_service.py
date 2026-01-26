from supabase import create_client, Client
import os
from typing import Dict, Any, Optional
import json

class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        self.client: Optional[Client] = None
        
        if url and key and url != "placeholder" and key != "placeholder":
            try:
                self.client = create_client(url, key)
            except Exception as e:
                print(f"Failed to initialize Supabase client: {e}")
        else:
            print("Supabase credentials not set. Caching disabled.")

    async def get_cached_price(self, make: str, model: str) -> Optional[Dict[str, Any]]:
        if not self.client:
            return None
            
        try:
            # Table 'equipment_prices'
            # Columns: id, make, model, data, created_at
            response = self.client.table("equipment_prices")\
                .select("data")\
                .eq("make", make)\
                .eq("model", model)\
                .execute()
            
            if response.data and len(response.data) > 0:
                print(f"Cache HIT for {make} {model}")
                return response.data[0]["data"]
        except Exception as e:
            print(f"Supabase read error: {e}")
            
        return None

    async def cache_price(self, make: str, model: str, data: Dict[str, Any]):
        if not self.client:
            return
            
        try:
            # Upsert logic based on make/model constraint
            self.client.table("equipment_prices").upsert({
                "make": make,
                "model": model,
                "data": data,
                # "updated_at": "now()" # let triggers handle this or client
            }, on_conflict="make,model").execute()
            print(f"Cached data for {make} {model}")
        except Exception as e:
            print(f"Supabase write error: {e}")
