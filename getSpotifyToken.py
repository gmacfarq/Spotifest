import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access Spotify client ID and client secret
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# Spotify API token URL
token_url = 'https://accounts.spotify.com/api/token'

# Create data payload for POST request
data = {
    'grant_type': 'client_credentials',
    'client_id': SPOTIFY_CLIENT_ID,
    'client_secret': SPOTIFY_CLIENT_SECRET
}

def get_token():
    """Get Spotify API token."""
    # Make the POST request
    response = requests.post(token_url, data=data, headers={'Content-Type': 'application/x-www-form-urlencoded'})

    if response.status_code == 200:
        response_data = response.json()
        access_token = response_data['access_token']
        return access_token
    else:
        return('Error:', response.text)