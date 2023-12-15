import base64
import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ["OPENAI_API_KEY"]


async def artists_from_image(file):
    """
    Takes in image and returns list of artists in image
    """

    base64_image = base64.b64encode(file).decode("utf-8")

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "do your best to list all artists in this image in a comma seperated list (do not use the newline character), disregard dates and make whatever assumptions you would like. DO NOT INCLUDE ANY DESCRIPTION OR PLEASANTRIES"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 1500,
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    return response.json()["choices"][0]["message"]