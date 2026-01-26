FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Playwright dependencies (commented out for initial build speed, will enable in Phase 3)
# RUN pip install playwright && playwright install --with-deps chromium

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
