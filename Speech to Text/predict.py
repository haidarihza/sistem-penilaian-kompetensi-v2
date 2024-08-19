from gradio_client import Client
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    link: str

def predict_speech_english(link):
    try:
        client = Client("https://42f0253f321e6b7e29.gradio.live") #link gradio
        result = client.predict(
            link,
            api_name="/predict"
        )
        print(result)
        return result
    except Exception as e:
        print(f"Error in predict_speech_english: {e}")
        return {"error": str(e)}

def predict_speech_indonesian(link):
    try:
        client = Client("https://b52037172bbc6109d5.gradio.live") #link gradio
        result = client.predict(
            link,
            api_name="/predict"
        )
        print(result)
        return result
    except Exception as e:
        print(f"Error in predict_speech_indonesian: {e}")
        return {"error": str(e)}

@app.post("/predict/english")
async def predict_english(item: Item):
    return predict_speech_english(item.link)

@app.post("/predict/indonesian")
async def predict_indonesian(item: Item):
    print(item.link)
    return predict_speech_indonesian(item.link)

@app.get("/")
async def read_root():
    return {"message": "Welcome to speech to text processing!"}