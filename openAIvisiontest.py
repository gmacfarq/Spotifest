from openai import OpenAI
import os

client = OpenAI(api_key='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')

response = client.chat.completions.create(
  model="gpt-4-vision-preview",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "list all artists from this festival lineup"},
        {
          "type": "image_url",
          "image_url": {
            "url": "https://assets.teenvogue.com/photos/63bdca040426b5dfc8653732/master/w_1280,c_limit/IMG_3857.jpg",
          },
        },
      ],
    }
  ],
  max_tokens=300,
)

print(response.choices[0])