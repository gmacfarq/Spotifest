import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

api_key = os.environ["ZIPCODE_API_KEY"]


def get_location(zipcode):
    """
    Takes in a zipcode and returns the city and state
    """
    headers = {"apikey": api_key}
    response = requests.get(
        f"https://api.zipcodestack.com/v1/search?codes={zipcode}&country=us",
        headers=headers,
    )
    data = response.json()
    city = data["results"][f"{zipcode}"][0]["city"]
    state = data["results"][f"{zipcode}"][0]["state_code"]
    return f"{city}, {state}"
