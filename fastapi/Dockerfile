FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt /app

RUN apt-get update && apt-get install -y git

RUN pip install -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]