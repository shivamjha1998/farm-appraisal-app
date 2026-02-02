# Farm Equipment Auto-Appraisal Mobile Application

A mobile application capable of instantly appraising farm equipment using AI. Users can take a photo of a tractor, combine, or other machinery, and the app utilizes Google Gemini Vision to identify the specific model number. It then scrapes Yahoo Auction "sold" listings to provide real-time market value estimates.

### Features
* **AI Identification**: Uses Google Gemini Pro Vision to detect Make, Model, and Equipment Type from photos.
* **Market Appraisal**: Scrapes Yahoo Auction Japan (Closed Search) to find actual transaction prices, not just asking prices.
* **Data Verification**: Cross-references identified models with DuckDuckGo search to ensure they exist before pricing.
* **Price Statistics**: automatically calculates Minimum, Maximum, Average, and Median market values.
* **Offline History**: Saves photos and appraisal results locally on the device for future reference.

### Tech Stack
* **Frontend**: React Native (Expo), TypeScript, Axios
* **Backend**: Python, FastAPI, BeautifulSoup4 (Scraping)
* **AI**: Google Gemini API (`gemini-flash-latest`)
* **Database**: Supabase (Optional, used for caching)

### Project Structure
```text
├── backend/
│   ├── src/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── services/
│   │   │   ├── gemini_service.py   # AI Image Analysis
│   │   │   ├── scraper_yahoo.py    # Auction Data Scraping
│   │   │   └── verification_service.py # Model existence check
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── App.tsx                # Main React Native component
│   ├── components/            # UI Components (Cards, Modals)
│   └── services/              # API and Storage services
```
### Instalation & Setup
#### 1. Backend Setup
The backend requires Python 3.9+ or Docker.
**Using Docker (Recommended):**
1. Create a ```.env``` file in the ```backend/``` directory:
```
GEMINI_API_KEY=your_google_gemini_key`
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_KEY=your_supabase_key (optional)
```
2. Run the container:
```
docker-compose up --build
```
The API will be available at `http://localhost:8000.`

**Manual Setup:**
1. Navigate to ```backend/```: ```cd backend```
2. Install dependencies: ```pip install -r requirements.txt```
3 .Run the server: ```uvicorn src.main:app --reload```

#### 2. Frontend Setup
1. Navigate to ```frontend/: cd frontend```
2. Install dependencies:
```
npm install
```
3. Configure the API URL:
* Open ```frontend/constants.ts```.
* Set ```API_URL``` to your computer's local network IP address `(e.g., http://192.168.1.100:8000)`.
* *Note: Do not use `localhost` if testing on a physical phone, as `localhost` refers to the phone itself.*

4. Start the app:
```
cd frontend
npx expo start
```

5. Scan the QR code with the Expo Go app on your Android or iOS device.

#### License
This project is licensed under the MIT License.