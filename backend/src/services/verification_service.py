from ddgs import DDGS
from typing import Dict, Any, Optional
import asyncio

class VerificationService:
    def __init__(self):
        pass

    async def verify_model_existence(self, make: str, model: str, equipment_type: str = "") -> Dict[str, Any]:
        """
        Verifies if the make and model exist by performing a web search.
        Returns a dictionary with 'verified' (bool) and 'source_url' (str).
        """
        if not make or not model:
            return {"verified": False, "reason": "Missing make or model"}

        query = f"{make} {model} {equipment_type}".strip()
        print(f"Verifying: {query}")

        try:
            # DuckDuckGo Search v6+ DDGS is synchronous.
            # We run it in a thread to avoid blocking the async event loop.
            def _search_sync():
                with DDGS() as ddgs:
                    return list(ddgs.text(query, max_results=5))

            results = await asyncio.to_thread(_search_sync)
            
            if not results:
                return {"verified": False, "reason": "No search results found"}

            # Simple heuristic: Check if the model number appears in the titles or snippets
            # of the search results.
            model_lower = model.lower()
            verified = False
            top_url = ""

            for res in results:
                title = res.get('title', '').lower()
                body = res.get('body', '').lower()
                
                # Check if model number is present in title or body
                if model_lower in title or model_lower in body:
                    verified = True
                    top_url = res.get('href', '')
                    break
            
            return {
                "verified": verified,
                "verification_source": top_url if verified else None,
                "note": "Model found in web search" if verified else "Model not explicitly found in top search results"
            }

        except Exception as e:
            print(f"Verification Error: {e}")
            return {"verified": False, "error": str(e)}