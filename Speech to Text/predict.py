from gradio_client import Client

def predict(request):
  link = request.form.get("link")
  client = Client("https://055e08c7490c5fdb81.gradio.live") #link gradio
  result = client.predict(
    link,
    api_name = "/predict"
  )
  return f'{result}'
