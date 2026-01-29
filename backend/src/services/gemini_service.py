import google.generativeai as genai
import os
import json
from typing import Dict, Any

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        genai.configure(api_key=api_key)
        # Using gemini-flash-latest (likely 1.5 flash alias) to avoid 404s and Quota issues
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def analyze_image(self, image_bytes: bytes) -> Dict[str, Any]:
        prompt = """
        You are an expert farm equipment appraiser. Analyze this image and identify the farm equipment.
        Return ONLY a raw JSON object (no markdown formatting) with the following fields:
        - make: The manufacturer (e.g., John Deere, Kubota, Case IH)
        - make_ja: The manufacturer in Japanese Katakana/Kanji (e.g., クボタ, ヤンマー).
        - model: The model number/name (e.g., 5075E, L2501). Be as specific as possible.
        - year_range: Estimated manufacturing year range (e.g., "2015-2020").
        - type: The type of equipment (e.g., Tractor, Combine, Baler).
        - type_ja: The type of equipment in Japanese (e.g., トラクター, コンバイン).
        - confidence: A number between 0.0 and 1.0 indicating your confidence in the identification.
        
        If you cannot identify the equipment with at least 0.5 confidence, return {"error": "Could not identify equipment", "confidence": <low_score>}.
        If the model number is unclear or partially obscured, return the closest known valid model series or just the series prefix (e.g., 'Ke Series') rather than guessing a specific number.
        """
        
        try:
            # Gemini accepts bytes directly in some SDK versions, but often needs a specific "blob" format
            # or PIL image. For the python SDK, we can pass a dict with mime_type and data.
            image_part = {
                "mime_type": "image/jpeg", # Assuming JPEG for now, or we can detect/pass it
                "data": image_bytes
            }
            
            response = self.model.generate_content([prompt, image_part])
            
            # Clean up response text to ensure valid JSON (sometimes models add ```json ... ```)
            text = response.text.replace("```json", "").replace("```", "").strip()
            
            return json.loads(text)
            
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return {"error": "Analysis failed", "details": str(e)}
