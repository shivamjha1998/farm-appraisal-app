import google.generativeai as genai
import os
import json
from typing import Dict, Any, Optional

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not set.")
            self.model = None
            return
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'gemini-flash-latest',
            generation_config={"response_mime_type": "application/json"}
        )

    async def analyze_image(self, image_bytes: bytes) -> Dict[str, Any]:
        if not self.model:
             return {"error": "Gemini API key not configured", "confidence": 0.0}

        prompt = """
        You are an expert farm equipment appraiser. Analyze this image and identify the farm equipment.
        Return a JSON object with these fields:
        - make: The manufacturer (e.g., John Deere, Kubota, Case IH)
        - make_ja: The manufacturer in Japanese Katakana/Kanji (e.g., クボタ, ヤンマー).
        - model: The model number/name (e.g., 5075E, L2501). Be as specific as possible.
        - year_range: Estimated manufacturing year range (e.g., "2015-2020").
        - type: The type of equipment (e.g., Tractor, Combine, Baler).
        - type_ja: The type of equipment in Japanese (e.g., トラクター, コンバイン).
        - confidence: A number between 0.0 and 1.0 indicating your confidence in the identification.
        
        If you cannot identify the equipment with at least 0.5 confidence, return {"error": "Could not identify equipment", "confidence": <low_score>}
        If the model number is unclear or partially obscured, return the closest known valid model series or just the series prefix (e.g., 'Ke Series') rather than guessing a specific number.
        """
        
        try:
            image_part = {
                "mime_type": "image/jpeg",
                "data": image_bytes
            }
            
            response = await self.model.generate_content_async([prompt, image_part])

            return json.loads(response.text)
            
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return {"error": "Analysis failed", "details": str(e)}
