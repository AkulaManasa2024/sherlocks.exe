import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'functions', 'nl-query-engine'))
from main import extract_graph, generate_pdf_base64

rows = [
    {"CaseMaster": {"CaseMasterID": 101, "CrimeNo": "FIR123", "PoliceStationID": 55}},
    {"Victim": {"VictimMasterID": 201, "VictimName": "John Doe", "CaseMasterID": 101}},
    {"Accused": {"AccusedMasterID": 301, "AccusedName": "Jane Doe", "CaseMasterID": 101}}
]

if __name__ == "__main__":
    import json
    print(json.dumps(extract_graph(rows), indent=2))
    pdf = generate_pdf_base64("What are the cases?", "Here is the data", rows)
    print("PDF length:", len(pdf) if type(pdf) == str else pdf)
