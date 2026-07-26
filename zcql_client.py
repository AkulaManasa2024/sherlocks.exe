import requests, os
from dotenv import load_dotenv
load_dotenv()

ZCQL_URL = "https://api.catalyst.zoho.in/baas/v1/project/56938000000013049/zcql/query"

def run_zcql(query):
    headers = {
        "Authorization": f"Zoho-oauthtoken {os.getenv('ACCESS_TOKEN')}",
        "CATALYST-ORG": "60078827774",
        "Content-Type": "application/json"
    }
    r = requests.post(ZCQL_URL, json={"query": query}, headers=headers)
    return r.status_code, r.json()

if __name__ == "__main__":
    print(run_zcql("SELECT CaseMasterID, CrimeNo FROM CaseMaster LIMIT 5"))