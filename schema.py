SCHEMA_BLOCK = """
CaseMaster(CaseMasterID PK, CrimeNo, CrimeRegisteredDate, PoliceStationID, CaseStatusID FK, CrimeMajorHeadID, latitude, longitude, BriefFacts)
ComplainantDetails(ComplainantID PK, CaseMasterID FK, ComplainantName, AgeYear, GenderID)
Victim(VictimMasterID PK, CaseMasterID FK, VictimName, AgeYear, GenderID)
Accused(AccusedMasterID PK, CaseMasterID FK, AccusedName, AgeYear, GenderID, PersonID)
ArrestSurrender(ArrestSurrenderID PK, CaseMasterID FK, AccusedMasterID FK, ArrestSurrenderTypeID, ArrestSurrenderDate)
CaseStatusMaster(CaseStatusID PK, CaseStatusName)
District(DistrictID PK, DistrictName)
CrimeSubHead(CrimeSubHeadID PK, CrimeHeadName)
"""