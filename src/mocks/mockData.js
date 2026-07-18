// Mock database fixture containing a realistic police-case-network shape.
// A few repeat accused across cases, shared locations, and realistic connections.

// ASSUMED SHAPE — confirm with backend
export const FULL_NETWORK = {
  nodes: [
    { id: "case_101", label: "Case 101: Sovereign Trust Bank Robbery", type: "case", details: "Armed heist at Sovereign Trust Bank, Downtown Metro District on May 12, 2026. Estimated loss of $500,000 in diamonds and cash. Chen Syndicate involvement suspected." },
    { id: "case_102", label: "Case 102: Syndicate Money Laundering", type: "case", details: "Shell company network transferring funds internationally. Traced back to account activities at Sovereign Trust Bank. Primary suspect Serena Chen." },
    { id: "case_103", label: "Case 103: Warehouse Cargo Theft", type: "case", details: "Theft of high-value electronics from Industrial Port Warehouse on June 18, 2026. Marcus Vance and Derrick Miller apprehended near the scene." },
    
    { id: "person_serena", label: "Serena Chen", type: "accused", details: "Suspected leader of the Chen Syndicate. Highly sophisticated planner. Focuses on financial schemes, money laundering, and fencing high-value items." },
    { id: "person_marcus", label: "Marcus Vance", type: "accused", details: "Known associate of Serena Chen. Specializes in physical entry and logistics. Arrested twice for commercial burglaries." },
    { id: "person_derrick", label: "Derrick Miller", type: "accused", details: "Local logistics driver. Hired hand for warehouse cargo movement. Frequently associates with Marcus Vance." },
    
    { id: "victim_apex", label: "Apex Jewelry Corp", type: "victim", details: "Owner of the diamonds stolen during the Sovereign Trust Bank robbery. Registered in the Central Business District." },
    { id: "victim_global", label: "Global Logistics Inc", type: "victim", details: "Owner of the Industrial Port Warehouse. Reported cargo thefts twice in the last 6 months." },
    
    { id: "loc_bank", label: "Sovereign Trust Bank", type: "location", details: "Location of the Case 101 heist. Also holds accounts for multiple shell companies managed by Serena Chen." },
    { id: "loc_downtown", label: "Downtown Metro District", type: "location", details: "Central business district. Frequent site of white-collar crimes and high-value targets." },
    { id: "loc_port", label: "Industrial Port Warehouse", type: "location", details: "Port district storage area. High traffic, complex geography, and low security coverage." }
  ],
  edges: [
    // Accused connections to cases
    { source: "person_marcus", target: "case_101", label: "Accused (Physical Entry)" },
    { source: "person_marcus", target: "case_103", label: "Accused (Apprehended)" },
    { source: "person_serena", target: "case_101", label: "Suspected Mastermind" },
    { source: "person_serena", target: "case_102", label: "Primary Suspect" },
    { source: "person_derrick", target: "case_103", label: "Accused (Driver)" },
    
    // Peer relationships
    { source: "person_marcus", target: "person_serena", label: " Syndicate Link" },
    { source: "person_derrick", target: "person_marcus", label: "Accomplice" },
    
    // Victim connections to cases
    { source: "victim_apex", target: "case_101", label: "Victim" },
    { source: "victim_global", target: "case_103", label: "Victim" },
    
    // Location connections
    { source: "loc_bank", target: "case_101", label: "Scene of Crime" },
    { source: "loc_bank", target: "case_102", label: "Bank Accounts Used" },
    { source: "loc_downtown", target: "loc_bank", label: "Located In" },
    { source: "loc_port", target: "case_103", label: "Scene of Crime" }
  ]
};

// Response mapping based on queries to make the demo interactive and interesting.
export const queryResponses = {
  // Query 1: Default / Overview
  "overview": {
    answer: "Welcome to the Police Crime Database search system. Currently indexing 3 active cases, 3 suspects, 2 corporate victims, and 3 locations. Click on any node in the graph to view intelligence reports, or type a query in the chat (e.g., 'Marcus Vance' or 'Case 101') to filter the network.",
    zcql_query: "SELECT * FROM crime_records WHERE status = 'active';",
    result_rows: [
      { case_id: "case_101", status: "active", primary_suspect: "Serena Chen" },
      { case_id: "case_102", status: "active", primary_suspect: "Serena Chen" },
      { case_id: "case_103", status: "active", primary_suspect: "Marcus Vance" }
    ],
    graph: FULL_NETWORK,
    sources: [
      "Case File #CR-2026-101 (Sovereign Trust)",
      "Case File #CR-2026-102 (Chen Money Laundering)",
      "Incident Report #IR-2026-884 (Port Theft)"
    ]
  },

  // Query 2: Marcus Vance
  "marcus vance": {
    answer: "Marcus Vance is identified as a physical execution specialist for commercial burglaries. He is directly implicated in Case 101 (Sovereign Trust Heist) and Case 103 (Warehouse Cargo Theft). Surveillance logs confirm he frequently acts under instructions from Serena Chen, and co-conspires with Derrick Miller, who serves as a logistics driver.",
    zcql_query: "SELECT c.case_id, c.title, e.role FROM cases c JOIN entities e ON c.case_id = e.case_id WHERE e.name = 'Marcus Vance';",
    result_rows: [
      { case_id: "case_101", title: "Sovereign Trust Bank Robbery", role: "Accused (Physical Entry)" },
      { case_id: "case_103", title: "Warehouse Cargo Theft", role: "Accused (Apprehended)" }
    ],
    graph: {
      nodes: [
        FULL_NETWORK.nodes.find(n => n.id === "person_marcus"),
        FULL_NETWORK.nodes.find(n => n.id === "person_serena"),
        FULL_NETWORK.nodes.find(n => n.id === "person_derrick"),
        FULL_NETWORK.nodes.find(n => n.id === "case_101"),
        FULL_NETWORK.nodes.find(n => n.id === "case_103")
      ],
      edges: [
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "case_103"),
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "person_serena"),
        FULL_NETWORK.edges.find(e => e.source === "person_derrick" && e.target === "person_marcus"),
        FULL_NETWORK.edges.find(e => e.source === "person_derrick" && e.target === "case_103")
      ]
    },
    sources: [
      "Vance Arrest History (FBI ID #992-MV)",
      "Incident Report #IR-2026-884 (Port Theft)",
      "Co-conspirator Wiretap Log #WT-0402"
    ]
  },

  // Query 3: Serena Chen
  "serena chen": {
    answer: "Serena Chen is the suspected coordinator of the Chen Syndicate. Intelligence indicators suggest she controls local burglary cells (including Marcus Vance) and manages the financial laundering of stolen goods. She is the central figure in Case 102 (Syndicate Money Laundering) and is linked to the Sovereign Trust Bank Robbery (Case 101) where the stolen diamonds are believed to have been fenced through her shell entities.",
    zcql_query: "SELECT * FROM entities e LEFT JOIN transactions t ON e.id = t.entity_id WHERE e.name = 'Serena Chen';",
    result_rows: [
      { suspect: "Serena Chen", network_role: "Syndicate Organizer", target_case: "Case 102" },
      { suspect: "Serena Chen", network_role: "Suspected Mastermind", target_case: "Case 101" }
    ],
    graph: {
      nodes: [
        FULL_NETWORK.nodes.find(n => n.id === "person_serena"),
        FULL_NETWORK.nodes.find(n => n.id === "person_marcus"),
        FULL_NETWORK.nodes.find(n => n.id === "case_101"),
        FULL_NETWORK.nodes.find(n => n.id === "case_102"),
        FULL_NETWORK.nodes.find(n => n.id === "loc_bank"),
        FULL_NETWORK.nodes.find(n => n.id === "loc_downtown")
      ],
      edges: [
        FULL_NETWORK.edges.find(e => e.source === "person_serena" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "person_serena" && e.target === "case_102"),
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "person_serena"),
        FULL_NETWORK.edges.find(e => e.source === "loc_bank" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "loc_bank" && e.target === "case_102"),
        FULL_NETWORK.edges.find(e => e.source === "loc_downtown" && e.target === "loc_bank")
      ]
    },
    sources: [
      "Financial Crimes Division Report #FC-2026-9",
      "Wiretap Transcripts (Serena Chen - May 10)",
      "Sovereign Trust Shell Accounts Audit Ledger"
    ]
  },

  // Query 4: Case 101 / Sovereign Trust Bank Robbery
  "case 101": {
    answer: "Case 101 refers to the armed bank heist at Sovereign Trust Bank, resulting in a loss of $500,000 in diamonds owned by Apex Jewelry Corp. Marcus Vance is identified as the physical burglar who forced entry, while Serena Chen is suspected of planning and organizing the heist. The bank itself serves as both the scene of the crime and the holder of the syndicate's laundering accounts.",
    zcql_query: "SELECT c.case_id, c.loss, v.name AS victim, s.name AS suspect FROM cases c JOIN victims v ON c.id = v.case_id JOIN suspects s ON c.id = s.case_id WHERE c.case_id = 'case_101';",
    result_rows: [
      { case_id: "case_101", loss: 500000, victim: "Apex Jewelry Corp", suspect: "Marcus Vance" },
      { case_id: "case_101", loss: 500000, victim: "Apex Jewelry Corp", suspect: "Serena Chen" }
    ],
    graph: {
      nodes: [
        FULL_NETWORK.nodes.find(n => n.id === "case_101"),
        FULL_NETWORK.nodes.find(n => n.id === "person_marcus"),
        FULL_NETWORK.nodes.find(n => n.id === "person_serena"),
        FULL_NETWORK.nodes.find(n => n.id === "victim_apex"),
        FULL_NETWORK.nodes.find(n => n.id === "loc_bank"),
        FULL_NETWORK.nodes.find(n => n.id === "loc_downtown")
      ],
      edges: [
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "person_serena" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "victim_apex" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "loc_bank" && e.target === "case_101"),
        FULL_NETWORK.edges.find(e => e.source === "loc_downtown" && e.target === "loc_bank"),
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "person_serena")
      ]
    },
    sources: [
      "Ballistics Report #B-102 (9mm shell casing)",
      "Apex Jewelry Commercial Shipping Invoice",
      "Sovereign Trust CCTV Logs (May 12, 02:44 AM)"
    ]
  },

  // Query 5: Warehouse Cargo Theft / Case 103
  "warehouse cargo theft": {
    answer: "Case 103 details the warehouse cargo theft of high-value electronics from Global Logistics Inc. The crime took place at the Industrial Port Warehouse. Marcus Vance and Derrick Miller were arrested post-incident near the perimeter of the port, with Miller serving as the driver. Ongoing investigations seek to connect the stolen cargo back to the Chen Syndicate's fencing network.",
    zcql_query: "SELECT * FROM cases c JOIN locations l ON c.location_id = l.id WHERE c.title LIKE '%Warehouse%';",
    result_rows: [
      { case_id: "case_103", title: "Warehouse Cargo Theft", location: "Industrial Port Warehouse", arrested: "Marcus Vance, Derrick Miller" }
    ],
    graph: {
      nodes: [
        FULL_NETWORK.nodes.find(n => n.id === "case_103"),
        FULL_NETWORK.nodes.find(n => n.id === "person_marcus"),
        FULL_NETWORK.nodes.find(n => n.id === "person_derrick"),
        FULL_NETWORK.nodes.find(n => n.id === "victim_global"),
        FULL_NETWORK.nodes.find(n => n.id === "loc_port")
      ],
      edges: [
        FULL_NETWORK.edges.find(e => e.source === "person_marcus" && e.target === "case_103"),
        FULL_NETWORK.edges.find(e => e.source === "person_derrick" && e.target === "case_103"),
        FULL_NETWORK.edges.find(e => e.source === "victim_global" && e.target === "case_103"),
        FULL_NETWORK.edges.find(e => e.source === "loc_port" && e.target === "case_103"),
        FULL_NETWORK.edges.find(e => e.source === "person_derrick" && e.target === "person_marcus")
      ]
    },
    sources: [
      "Port Security Patrol Dispatch Logs",
      "Global Logistics Cargo Manifest #442-A",
      "Dashcam footage (Patrol Car 4)"
    ]
  }
};

// Aliases for matching queries
queryResponses["case 103"] = queryResponses["warehouse cargo theft"];
queryResponses["cargo theft"] = queryResponses["warehouse cargo theft"];
queryResponses["sovereign trust"] = queryResponses["case 101"];
queryResponses["sovereign trust bank"] = queryResponses["case 101"];
queryResponses["chen syndicate"] = queryResponses["serena chen"];

export const getResponseForQuery = (queryText) => {
  const normalized = queryText.toLowerCase().trim();
  
  // Try exact or substring match in our predefined responses
  for (const key of Object.keys(queryResponses)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return queryResponses[key];
    }
  }
  
  // Fallback response for unmatched queries
  return {
    answer: `Search completed for "${queryText}". No specific intelligence brief exists matching this exact keyword, but we have filtered the current database nodes for any partial text match. Double-click elements on the graph to inspect individual entities.`,
    zcql_query: `SELECT * FROM crime_records WHERE MATCH(label, details) AGAINST ('${queryText.replace(/'/g, "''")}');`,
    result_rows: [],
    sources: ["Global Intelligence Database Index"],
    graph: {
      // Return elements that contain the search term in their label or details
      nodes: FULL_NETWORK.nodes.filter(n => 
        n.label.toLowerCase().includes(normalized) || 
        n.details.toLowerCase().includes(normalized)
      ),
      edges: FULL_NETWORK.edges.filter(e => {
        const sourceNode = FULL_NETWORK.nodes.find(n => n.id === e.source);
        const targetNode = FULL_NETWORK.nodes.find(n => n.id === e.target);
        return (
          (sourceNode && (sourceNode.label.toLowerCase().includes(normalized) || sourceNode.details.toLowerCase().includes(normalized))) ||
          (targetNode && (targetNode.label.toLowerCase().includes(normalized) || targetNode.details.toLowerCase().includes(normalized)))
        );
      })
    }
  };
};
