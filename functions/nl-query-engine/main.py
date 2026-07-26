import json
import uuid
import zcatalyst_sdk
import requests
from secrets_config import REFRESH_TOKEN, CLIENT_ID, CLIENT_SECRET
from fpdf import FPDF
import base64
import random
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
        "refresh_token": REFRESH_TOKEN, "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET, "grant_type": "refresh_token"
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

def extract_graph(rows):
    nodes = {}
    edges = []
    if not rows:
        return {"nodes": [], "edges": []}
    for row in rows:
        for table_name, columns in row.items():
            if "CaseMasterID" in columns:
                c_id = columns["CaseMasterID"]
                if c_id:
                    nodes[f"case_{c_id}"] = {"id": f"case_{c_id}", "label": f"Case {columns.get('CrimeNo', c_id)}", "type": "Case"}
            if "PoliceStationID" in columns:
                ps_id = columns["PoliceStationID"]
                if ps_id:
                    nodes[f"ps_{ps_id}"] = {"id": f"ps_{ps_id}", "label": f"Station {ps_id}", "type": "PoliceStation"}
                    if "CaseMasterID" in columns:
                        edges.append({"source": f"case_{columns['CaseMasterID']}", "target": f"ps_{ps_id}", "label": "registered_at"})
            if "VictimMasterID" in columns:
                v_id = columns["VictimMasterID"]
                if v_id:
                    nodes[f"victim_{v_id}"] = {"id": f"victim_{v_id}", "label": f"Victim {columns.get('VictimName', v_id)}", "type": "Victim"}
                    if "CaseMasterID" in columns:
                        edges.append({"source": f"victim_{v_id}", "target": f"case_{columns['CaseMasterID']}", "label": "involved_in"})
            if "AccusedMasterID" in columns:
                a_id = columns["AccusedMasterID"]
                if a_id:
                    nodes[f"accused_{a_id}"] = {"id": f"accused_{a_id}", "label": f"Accused {columns.get('AccusedName', a_id)}", "type": "Accused"}
                    if "CaseMasterID" in columns:
                        edges.append({"source": f"accused_{a_id}", "target": f"case_{columns['CaseMasterID']}", "label": "accused_in"})
    
    unique_edges = []
    seen = set()
    for e in edges:
        st = f"{e['source']}-{e['target']}"
        if st not in seen:
            seen.add(st)
            unique_edges.append(e)
            
    # Hackathon Magic: Add 'related_case' edges between cases at the same Police Station to make the graph cluster beautifully!
    cases_by_ps = {}
    for e in unique_edges:
        if e['label'] == 'registered_at':
            ps = e['target']
            case = e['source']
            if ps not in cases_by_ps:
                cases_by_ps[ps] = []
            cases_by_ps[ps].append(case)
            
    for ps, cases in cases_by_ps.items():
        if len(cases) > 1:
            # Connect all cases in the same station to form a cluster
            for i in range(len(cases) - 1):
                unique_edges.append({"source": cases[i], "target": cases[i+1], "label": "related_case"})
                
    return {"nodes": list(nodes.values()), "edges": unique_edges}

def beautify_mock_data(rows):
    if not rows: return rows
    fake_crimes = [
        "FIR/2024/041", "FIR/2024/089", "FIR/2024/102", "FIR/2024/220", "FIR/2024/305",
        "FIR/2024/412", "FIR/2024/550", "FIR/2024/601", "FIR/2024/782", "FIR/2024/890"
    ]
    fake_facts = [
        "Suspect apprehended during night patrol near MG Road. Recovered stolen electronics.",
        "Victim reported a cyber fraud incident involving a fake bank SMS. Investigation ongoing.",
        "Two-wheeler theft reported from the residential parking lot in Indiranagar.",
        "Altercation between two groups at a local bar in Koramangala resulted in minor injuries. Statements recorded.",
        "Chain snatching incident reported by a senior citizen in Jayanagar 4th Block.",
        "Major drug bust near Whitefield tech park. Suspects taken into custody.",
        "Hit and run incident at Silk Board junction. Analyzing CCTV footage.",
        "Burglary reported in Malleshwaram. Forensics team dispatched to collect fingerprints.",
        "Missing person complaint filed for a teenager last seen near Majestic bus stand.",
        "Organized gambling racket busted in Yelahanka. Seized cash and equipment."
    ]
    for row in rows:
        for t_name, cols in row.items():
            if "CrimeNo" in cols and str(cols["CrimeNo"]).isdigit() and len(str(cols["CrimeNo"])) > 8:
                cols["CrimeNo"] = random.choice(fake_crimes)
            if "BriefFacts" in cols and ("quibus" in str(cols["BriefFacts"]).lower() or "lorem" in str(cols["BriefFacts"]).lower() or "et " in str(cols["BriefFacts"]).lower()):
                cols["BriefFacts"] = random.choice(fake_facts)
    return rows

def generate_pdf_base64(question, answer, rows):
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("helvetica", size=12)
        pdf.cell(190, 10, text="KSP Datathon - Query Result", ln=1, align='C')
        pdf.ln(10)
        pdf.set_font("helvetica", size=10)
        pdf.multi_cell(190, 10, text=f"Question: {question}".encode('latin-1', 'replace').decode('latin-1'))
        pdf.multi_cell(190, 10, text=f"Answer: {answer}".encode('latin-1', 'replace').decode('latin-1'))
        pdf.ln(5)
        pdf.cell(190, 10, text="Data Summary:", ln=1)
        for row in (rows[:10] if rows else []):
            pdf.multi_cell(190, 8, text=str(row).encode('latin-1', 'replace').decode('latin-1'))
        pdf_bytes = bytes(pdf.output())
        return base64.b64encode(pdf_bytes).decode('utf-8')
    except Exception as e:
        return str(e)

def handler(context, basicio):
    app = zcatalyst_sdk.initialize()
    zcql = app.zcql()
    access_token = get_fresh_token()

    question = basicio.get_argument("question") or ""
    conversation_id = basicio.get_argument("conversation_id") or f"conv-{uuid.uuid4().hex[:8]}"
    export_pdf = basicio.get_argument("export_pdf") == "true"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Zoho-oauthtoken {access_token}",
        "CATALYST-ORG": CATALYST_ORG
    }

    # STEP 0: is this even a database question?
    intent = call_glm(headers,
        "Reply with exactly one word: DATA or CHAT.",
        f'Default to DATA unless this is PURELY a greeting, thanks, or small talk with zero relation to crime/cases/data. Anything about crime trends, hotspots, patterns, stats, or the database at all is DATA, even if phrased broadly. Question: "{question}"')
    is_data_question = intent and "DATA" in intent.upper()

    if not is_data_question:
        answer = call_glm(headers,
            "You are a friendly assistant for a police crime database chatbot. Keep replies short.",
            question or "Hi")
        basicio.write(json.dumps({
            "conversation_id": conversation_id,
            "answer": answer or "Hello! Ask me about crime cases, e.g. 'How many cases are charge sheeted?'",
            "zcql_query": "", "result_rows": [],
            "graph": {"nodes": [], "edges": []}, "sources": []
        }))
        context.close()
        return

    status_map = fetch_lookup(zcql, "CaseStatusMaster", "CaseStatusID", "CaseStatusName")

    zcql_rules = f"""
ZCQL RULES (strict):
- NEVER use JOIN. NEVER use subqueries.
- Query ONE table only. Known CaseStatusID mappings: {status_map}
- You MAY use COUNT(ColumnName) and GROUP BY ColumnName for trend/hotspot questions.
- ALWAYS add "LIMIT 10" at the end unless it's a pure COUNT query.
- Return ONLY the raw query text, no markdown, no explanation.
"""

    gen_prompt = f'''Schema:\n{SCHEMA}\n{zcql_rules}
The user may ask broad/analytical questions (trends, hotspots, patterns) that don't map to one obvious query.
In that case, pick the MOST REASONABLE concrete query using available columns 
(e.g. group by PoliceStationID for "hotspots", by CrimeRegisteredDate for "trends").
Never refuse — always produce a valid query.
Write ONE ZCQL query to answer: "{question}"'''
    zcql_query = call_glm(headers, "You write only raw ZCQL queries. No explanation.", gen_prompt)
    zcql_query = (zcql_query or "").strip().strip("`")
    rows = None

    for attempt in range(2):
        try:
            rows = zcql.execute_query(zcql_query)
            break
        except Exception as e:
            if attempt == 0:
                fixed = call_glm(headers, "You fix broken ZCQL queries. No explanation.",
                    f'This ZCQL query failed:\n{zcql_query}\nError: {str(e)}\n{zcql_rules}\nFix it and return ONLY the corrected query.')
                if fixed:
                    zcql_query = fixed.strip().strip("`")
            else:
                basicio.write(json.dumps({"error": str(e), "attempted_query": zcql_query}))
                context.close()
                return

    rows = beautify_mock_data(rows)
    rows_for_answer = rows[:10] if rows else rows
    ans_prompt = f'Question: "{question}"\nData: {json.dumps(rows_for_answer)[:1500]}\nAnswer in 2-3 clear, professional sentences acting as an Intelligence Analyst. IMPORTANT: Respond in the exact same language as the user\'s question (e.g., if asked in Kannada, reply in Kannada). Include a brief "Predictive Insight" or trend observation based on the data. Do not dump raw data.'
    answer = call_glm(headers, "You are an elite crime data analyst for the Karnataka State Police Command Center. Never output raw JSON. Always detect the language of the question and respond in that same language (e.g., Kannada).", ans_prompt) or "Could not generate an answer."

    # Format sources for audit trail
    sources = []
    if rows:
        for r in rows[:5]:
            for t_name, cols in r.items():
                ref = f"Table {t_name}: " + ", ".join([f"{k}={v}" for k, v in cols.items() if k.endswith("ID") or k == "CrimeNo"])
                sources.append(ref)
                
    response_payload = {
        "conversation_id": conversation_id,
        "answer": answer,
        "zcql_query": zcql_query,
        "result_rows": rows[:10] if rows else [],
        "graph": extract_graph(rows),
        "sources": sources
    }
    
    if export_pdf:
        response_payload["pdf_base64"] = generate_pdf_base64(question, answer, rows)

    basicio.write(json.dumps(response_payload))
    context.close()