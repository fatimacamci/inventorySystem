FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ensure scripts are executable inside the image
RUN chmod +x ./scripts/*.sh || true

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]