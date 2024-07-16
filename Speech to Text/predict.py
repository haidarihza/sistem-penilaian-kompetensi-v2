from gradio_client import Client
from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

class Item(BaseModel):
  link: str

def predict_speech(link):
  client = Client("https://a80514782efb51f0b5.gradio.live") #link gradio
  result = client.predict(
    link,
    api_name = "/predict"
  )
  print(result)
  return f'{result}'

@app.post("/predict")
async def predict(item: Item):
  return predict_speech(item.link)

@app.get("/")
async def predict():
  return {"message": "Welcome to this fantastic app!"}