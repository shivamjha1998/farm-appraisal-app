# Farm Equipment Appraisal API Documentation

**Base URL:** `http://localhost:8000` (Development)

The Farm Equipment Appraisal API provides endpoints to identify farm equipment from images using Google Gemini Vision and retrieve market pricing data from Yahoo Auctions Japan.

## Authentication
Currently, the API is public and does not require authentication headers.

---

## Endpoints

### 1. Analyze Image
Uploads an image file to be analyzed by the AI. It identifies the equipment and automatically fetches market data.

* **URL:** `/api/analyze-image`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`

#### Request Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | File | Yes | The image file to analyze (JPEG, PNG, WEBP). |

#### Success Response (200 OK)
Returns a JSON object containing the identified equipment details and market statistics.

```json
{
  "make": "Kubota",
  "make_ja": "クボタ",
  "model": "L2501",
  "type": "Tractor",
  "type_ja": "トラクター",
  "year_range": "2015-2020",
  "confidence": 0.98,
  "verified": true,
  "verification_source": "[https://duckduckgo.com/](https://duckduckgo.com/)...",
  "market_data": [
    {
      "title": "Kubota L2501 4WD Tractor 500hrs",
      "price": 1450000,
      "currency": "JPY",
      "url": "[https://page.auctions.yahoo.co.jp/](https://page.auctions.yahoo.co.jp/)...",
      "image_url": "[https://auctions.c.yimg.jp/](https://auctions.c.yimg.jp/)...",
      "date": "12/05 21:00",
      "source": "Yahoo Auctions (Sold)"
    }
  ],
  "price_stats": {
    "min": 1200000,
    "max": 1800000,
    "avg": 1500000,
    "median": 1450000,
    "currency": "JPY"
  }
}
```

#### Error Responses
* **503 Service Unavailable:** "Gemini Service not configured" (Check API Key).
* **400 Bad Request:** "Invalid image format."
* **500 Internal Server Error:** General processing error.

---

### 2. Search Prices
Manually search for equipment prices using specific make and model details. This is useful for refining results or searching without an image.
* ***URL:***```/api/search-prices```
* ***Method:*** ```GET```

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | Yes | The model number (e.g., "L2501"). |
| `make` | string | No | The manufacturer name (e.g., "Kubota"). |
| `type` | string | No | The type of equipment (e.g., "Tractor"). |
| `year` | string | No | Estimated year range (unused in search logic, but returned). |

#### Example Request
```GET /api/search-prices?make=Kubota&model=L2501&type=Tractor```

##### Success Response (200 OK)
Returns a JSON object with the provided details and a ```market_data``` array containing sold listings (same structure as ```/analyze-image```).

```json
{
  "make": "Kubota",
  "model": "L2501",
  "type": "Tractor",
  "year_range": "Unknown",
  "confidence": 1.1,
  "market_data": [...],
  "price_stats": {
    "min": 1200000,
    "max": 1800000,
    "avg": 1500000,
    "median": 1450000,
    "currency": "JPY"
  }
}
```

### 3. Health Check
Verifies that the API server is running.
* ***URL:*** ```/health```
* ***Method:*** ```GET```

#### Response
```json
{ "status": "ok" }
```