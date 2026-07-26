import requests
from dotenv import load_dotenv
import os

load_dotenv()

url = "https://accounts.zoho.in/oauth/v2/token"
params = {
    "client_id": os.getenv("CLIENT_ID"),
    "client_secret": os.getenv("CLIENT_SECRET"),
    "code": os.getenv("AUTH_CODE"),
    "grant_type": "authorization_code"
}

response = requests.post(url, params=params)
print(response.json())