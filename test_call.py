import requests
from dotenv import load_dotenv
import os

load_dotenv()

url = "https://api.catalyst.zoho.in/quickml/v1/project/56938000000013049/glm/chat"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Zoho-oauthtoken {os.getenv('ACCESS_TOKEN')}",
    "CATALYST-ORG": "60078827774"
}

data = {
    "model": "crm-di-glm47b_30b_it",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello in one sentence."}
    ],
    "max_tokens": 500,
    "temperature": 0.7,
    "stream": False,
    "chat_template_kwargs": {"enable_thinking": False}
}

response = requests.post(url, json=data, headers=headers)
print(response.status_code)
print(response.json())