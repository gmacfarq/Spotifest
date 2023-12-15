from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

response = client.chat.completions.create(
  model="gpt-4-vision-preview",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "do your best to list all artists in this image in a comma seperated list, disregard dates and make whatever assumptions you would like. DO NOT INCLUDE ANY DESCRIPTION OR PLEASANTRIES"},
        {
          "type": "image_url",
          "image_url": {
            "url": "https://assets.teenvogue.com/photos/63bdca040426b5dfc8653732/master/w_1280,c_limit/IMG_3857.jpg",
            "detail": "high",
          },
        },
      ],
    }
  ],
  max_tokens=1500,
)

print(response.choices[0])