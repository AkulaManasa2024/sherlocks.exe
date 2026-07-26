import json
import uuid
import os
import zcatalyst_sdk
import requests
from dotenv import load_dotenv

load_dotenv()

SCHEMA = """
CaseMaster(CaseMasterID PK, CrimeNo, CrimeRegisteredDate, PoliceStationID, CaseStatusID, CrimeMajorHeadID, latitude, longitude, BriefFacts)
ComplainantDetails(ComplainantID PK, CaseMasterID, ComplainantName, AgeYear, GenderID)
Victim(VictimMasterID PK, CaseMasterID, VictimName, AgeYear, GenderID)
Accused(AccusedMasterID PK, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID)
ArrestSurrender(ArrestSurrenderID PK, CaseMasterID, AccusedMasterID, ArrestSurrenderTypeID, ArrestSurrenderDate)
"""

GLM_URL = "https://api.catalyst.zoho.in/quickml/v1/project/56938000000013049/glm/chat"
CATALYST_ORG = "60078827774"

def get_fresh_token():
    r = requests.post("https://accounts.zoho.in/oauth/v2/token", params={
        "refresh_token": os.getenv("REFRESH_TOKEN"),
        "client_id": os.getenv("CLIENT_ID"),
        "client_secret": os.getenv("CLIENT_SECRET"),
        "grant_type": "refresh_token"
    })
    return r.json()["access_token"]

def call_glm(headers, system_prompt, user_prompt):
    resp = requests.post(GLM_URL, headers=headers, json={
        "model": "crm-di-glm47b_30b_it",
        "messages": [{"role": "system", "content": system_prompt},
                     {"role": "user", "content": user_prompt}],
        "max_tokens": 400, "temperature": 0.1, "stream": False,
        "chat_template_kwargs": {"enable_thinking": False}
    }).json()
    return resp.get("response")

def fetch_lookup(zcql, table, id_col, name_col):
    try:
        rows = zcql.execute_query(f"SELECT {id_col}, {name_col} FROM {table}")
        return {r[table][name_col]: r[table][id_col] for r in rows}
    except Exception:
        return {}

def handler(context, basicio):
    app = zcatalyst_sdk.initialize()
    zcql = app.zcql()
    access_token = get_fresh_token()

    question = basicio.get_argument("question") or "How many cases are charge sheeted?"
    conversation_id = basicio.get_argument("conversation_id") or f"conv-{uuid.uuid4().hex[:8]}"

    # Pre-fetch lookups so GLM gets real IDs, no JOIN needed
    status_map = fetch_lookup(zcql, "CaseStatusMaster", "CaseStatusID", "CaseStatusName")
    crimehead_map = fetch_lookup(zcql, "CrimeSubHead", "CrimeSubHeadID", "CrimeHeadName")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Zoho-oauthtoken {access_token}",
        "CATALYST-ORG": CATALYST_ORG
    }

    zcql_rules = f"""
ZCQL RULES (strict):
- NEVER use JOIN (relationships aren't configured in Data Store yet).
- NEVER use COUNT(*), use COUNT(ColumnName) instead.
- NEVER use subqueries.
- Query ONE table only.
- Known CaseStatusID mappings: {status_map}
- Known CrimeSubHeadID mappings: {crimehead_map}
- If the question mentions a status/category name, use its numeric ID directly from the mappings above.
- Return ONLY the raw query text, no markdown, no explanation.
"""

    gen_prompt = f'Schema:\n{SCHEMA}\n{zcql_rules}\nWrite ONE ZCQL query to answer: "{question}"'
    zcql_query = call_glm(headers, "You write only raw ZCQL queries. No explanation.", gen_prompt)

    if not zcql_query:
        basicio.write(json.dumps({"error": "GLM failed to generate a query"}))
        context.close()
        return

    zcql_query = zcql_query.strip().strip("`")
    rows = None

    for attempt in range(2):
        try:
            rows = zcql.execute_query(zcql_query)
            break
        except Exception as e:
            if attempt == 0:
                fix_prompt = f'This ZCQL query failed:\n{zcql_query}\nError: {str(e)}\n{zcql_rules}\nFix it and return ONLY the corrected query.'
                fixed = call_glm(headers, "You fix broken ZCQL queries. No explanation.", fix_prompt)
                if fixed:
                    zcql_query = fixed.strip().strip("`")
            else:
                basicio.write(json.dumps({"error": str(e), "attempted_query": zcql_query}))
                context.close()
                return

    ans_prompt = f'Question: "{question}"\nData: {json.dumps(rows)[:2000]}\nAnswer in ONE clear sentence, plain English.'
    answer = call_glm(headers, "You are a helpful crime data assistant.", ans_prompt) or "Could not generate an answer."

    basicio.write(json.dumps({
        "conversation_id": conversation_id,
        "answer": answer,
        "zcql_query": zcql_query,
        "result_rows": rows,
        "graph": {"nodes": [], "edges": []},
        "sources": [str(r) for r in rows][:10]
    }))
    context.close()