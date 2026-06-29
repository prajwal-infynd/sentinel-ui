import { Router } from "express";
import {
  users,
  mockEntities,
  dashboardSummary,
  sampleAlerts,
  agentActivities,
  policyConfigs,
  globalAuditLogs,
} from "../data/store";

const router = Router();

// --- Auth Routes ---
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && password === "harish@123");
  if (user) {
    res.json({ user, token: "mock-jwt-token" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

router.post("/auth/signup", (req, res) => {
  const { email, name } = req.body;
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role: "Analyst",
    status: "Active",
    tokensUsed: "0",
    cost: "$0.00",
    computedPermissions: ["view_dashboard", "run_agents"],
  };
  users.push(newUser as any);
  res.json({ user: newUser, token: "mock-jwt-token" });
});

// --- Admin Routes ---
router.get("/admin/users", (req, res) => {
  res.json(users);
});

router.patch("/admin/users/:id/status", (req, res) => {
  const { status } = req.body;
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    user.status = status;
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

router.delete("/admin/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index > -1) {
    users.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// --- Portfolio Routes ---
router.get("/portfolio/entities", (req, res) => {
  res.json(mockEntities);
});

router.get("/dashboard/summary", (req, res) => {
  res.json(dashboardSummary);
});

router.patch("/portfolio/entities/:id/status", (req, res) => {
  const { status } = req.body;
  const entity = mockEntities.find((e) => e.id === req.params.id);
  if (entity) {
    entity.status = status;
    if (status === "Monitoring") dashboardSummary.entityCount++;
    res.json(entity);
  } else {
    res.status(404).json({ message: "Entity not found" });
  }
});

router.patch("/portfolio/entities/:id/kyb-status", (req, res) => {
  const { kyb_status } = req.body;
  const entity = mockEntities.find((e) => e.id === req.params.id);
  if (entity) {
    (entity as any).kyb_status = kyb_status;
    res.json(entity);
  } else {
    res.status(404).json({ message: "Entity not found" });
  }
});

router.post("/portfolio/import", (req, res) => {
  const rows = req.body;
  const importCount = Array.isArray(rows) ? rows.length : 1;
  dashboardSummary.entityCount = importCount;
  res.json({ imported: importCount });
});
router.get("/portfolio/sample-preview", (req, res) => {
  res.json([
    {
      "masterEntityProfile": {
        "fullName": "Apple Inc",
        "aliases": ["Apple", "Apple Computer, Inc.", "Apple Computer Company"],
        "dateOfBirth": "1976-04-01T00:00:00Z",
        "jurisdiction": "US",
        "linkedJurisdictions": ["US", "China"],
        "legalType": "Public",
        "address": "One Apple Park Way, Cupertino, California, 95014",
        "website": "apple.com",
        "phone": "(408) 996-1010",
        "status": "ACTIVE",
        "identifiers": [
          { "type": "Ticker", "value": "AAPL" },
          { "type": "DUNS", "value": null }
        ],
        "aboutCompany": {
          "brief": "American multinational technology company headquartered in Cupertino, California, known for consumer electronics, software and online services.",
          "fullRiskAssessment": "Apple Inc. is an American multinational technology company headquartered in Cupertino, California, in Silicon Valley, and known for consumer electronics, software and online services. Founded in 1976 as Apple Computer Company by Steve Jobs, Steve Wozniak and Ronald Wayne, the company was incorporated by Jobs and Wozniak as Apple Computer, Inc. the following year."
        },
        "financials": {
          "revenue": 111180000000,
          "currency": "USD",
          "employees": 166000,
          "fiscalYear": "Mar 2026",
          "sector": "Computers, Peripherals, and Software",
          "dataSource": "Provided source data"
        },
        "keyPersonnel": [
          { "name": "Tim Cook", "role": "CEO" }
        ],
        "keyCompetitors": [
          { "name": "Samsung", "duns": "N/A", "tier": null }
        ]
      }
    },
    {
      "masterEntityProfile": {
        "fullName": "B & M Retail Limited",
        "aliases": ["B&M", "B&M European Value Retail S.A."],
        "dateOfBirth": "1978-03-14T00:00:00Z",
        "jurisdiction": "Jersey",
        "linkedJurisdictions": ["Jersey", "UK", "France"],
        "legalType": "Public",
        "address": "26, New Street, St Helier, Jersey, JE2 3RA",
        "website": "bandmretail.com",
        "phone": "+44 1534 507000",
        "status": "ACTIVE",
        "identifiers": [
          { "type": "Ticker", "value": "BME" },
          { "type": "DUNS", "value": null }
        ],
        "aboutCompany": {
          "brief": "British multinational variety store and garden centre chain founded in 1978, based in Liverpool, England.",
          "fullRiskAssessment": "B & M Retail Limited, trading as B&M, is a British multinational variety store and garden centre chain founded in 1978 and based in Liverpool, England."
        },
        "financials": {
          "revenue": 1510000000,
          "currency": "GBP",
          "employees": 39100,
          "fiscalYear": "Mar 2026",
          "sector": "Consumer",
          "dataSource": "Provided source data"
        },
        "keyPersonnel": [
          { "name": "Tjeerd Jegen", "role": "Chief Executive Officer" }
        ],
        "keyCompetitors": [
          { "name": "Anzu", "duns": "N/A", "tier": null }
        ]
      }
    },
    {
      "masterEntityProfile": {
        "fullName": "Bodycote PLC",
        "aliases": ["Bodycote plc", "Bodycote"],
        "dateOfBirth": "1923-01-01T00:00:00Z",
        "jurisdiction": "UK",
        "linkedJurisdictions": ["UK"],
        "legalType": "Public",
        "address": "Springwood Court, Springwood Close, Tytherington Business Park, Macclesfield, Cheshire, SK10 2XF, United Kingdom",
        "website": "bodycote.com",
        "phone": "+44 (0)1625 505300",
        "status": "ACTIVE",
        "identifiers": [
          { "type": "Ticker", "value": "BOY" },
          { "type": "DUNS", "value": null }
        ],
        "aboutCompany": {
          "brief": "Supplier of heat treatments, metal joining, hot isostatic pressing and coating services, based in Macclesfield, UK.",
          "fullRiskAssessment": "Bodycote plc is a supplier of heat treatments, metal joining, hot isostatic pressing and coating services."
        },
        "financials": {
          "revenue": 179050000,
          "currency": "GBP",
          "employees": 3920,
          "fiscalYear": "Dec 2025",
          "sector": "Machine industry",
          "dataSource": "Provided source data"
        },
        "keyPersonnel": [
          { "name": "Jim Fairbairn", "role": "Chief Executive Officer" }
        ],
        "keyCompetitors": [
          { "name": "Vinci", "duns": "N/A", "tier": null }
        ]
      }
    },
    {
      "masterEntityProfile": {
        "fullName": "BP plc",
        "aliases": ["BP p.l.c.", "BP", "British Petroleum"],
        "dateOfBirth": "1909-04-14T00:00:00Z",
        "jurisdiction": "UK",
        "linkedJurisdictions": ["UK", "Iran", "US"],
        "legalType": "Public",
        "address": "1 St James's Square, London, SW1Y 4PD, UK",
        "website": "bp.com",
        "phone": "+44 (0)20 7496 4000",
        "status": "ACTIVE",
        "identifiers": [
          { "type": "Ticker", "value": "BP" },
          { "type": "DUNS", "value": null }
        ],
        "aboutCompany": {
          "brief": "British multinational oil and gas 'supermajor' headquartered in London, vertically integrated across the oil and gas industry.",
          "fullRiskAssessment": "BP p.l.c. is a British multinational oil and gas company headquartered in London, England."
        },
        "financials": {
          "revenue": 51830000000,
          "currency": "GBP",
          "employees": 93700,
          "fiscalYear": "Mar 2026",
          "sector": "Energy",
          "dataSource": "Provided source data"
        },
        "keyPersonnel": [
          { "name": "Meg O'Neill", "role": "Chief Executive Officer (CEO)" }
        ],
        "keyCompetitors": [
          { "name": "RIT Capital Partners", "duns": "N/A", "tier": null }
        ]
      }
    },
    {
      "masterEntityProfile": {
        "fullName": "Caledonia Investments plc",
        "aliases": ["Caledonia Investments", "Caledonia"],
        "dateOfBirth": "1928-01-01T00:00:00Z",
        "jurisdiction": "UK",
        "linkedJurisdictions": ["UK"],
        "legalType": "Public",
        "address": "Cayzer House, 30 Buckingham Gate, London SW1E 6NN",
        "website": "caledonia.com",
        "phone": "020 7802 8080",
        "status": "ACTIVE",
        "identifiers": [
          { "type": "Ticker", "value": "CLDN" },
          { "type": "DUNS", "value": null }
        ],
        "aboutCompany": {
          "brief": "Self-managed investment trust company based in London, listed on the London Stock Exchange and a constituent of the FTSE 250 Index.",
          "fullRiskAssessment": "Caledonia Investments plc is a self-managed investment trust company based in London, England."
        },
        "financials": {
          "revenue": 10900000,
          "currency": "GBP",
          "employees": 82,
          "fiscalYear": "Mar 2026",
          "sector": "Capital market",
          "dataSource": "Provided source data"
        },
        "keyPersonnel": [
          { "name": "Mat Masters", "role": "CEO" }
        ],
        "keyCompetitors": [
          { "name": "Steelite", "duns": "N/A", "tier": null }
        ]
      }
    }
  ]);
});


// --- Alerts and Agents ---
router.get("/alerts", (req, res) => {
  res.json(sampleAlerts.slice(0, 5));
});

router.get("/agents/runs", (req, res) => {
  res.json(agentActivities);
});

router.get("/investigations/snapshot", (req, res) => {
  res.json({ activeCases: 12, pendingReview: 5, resolvedToday: 8, avgResolutionTime: "2.4 hours" });
});

// --- Media Routes ---
router.get("/media/summary", (req, res) => {
  res.json({ totalArticles: 14500, activeAlerts: 24, sourcesTracked: 1250, criticalEntities: 12 });
});

router.get("/media/agents-overview", (req, res) => {
  res.json([
    { id: 1, name: "Global Crawler", type: "Extraction", status: "Active", uptime: "99.9%", processedToday: 4250, accuracy: 98, lastAction: "Crawled 50 sources" },
    { id: 2, name: "Sanctions Matcher", type: "Matching", status: "Active", uptime: "99.9%", processedToday: 1200, accuracy: 99, lastAction: "Matched 5 entities" }
  ]);
});

router.post("/media/agents/run", (req, res) => {
  res.json({ success: true, message: "Agent run initiated." });
});

// --- Policy Routes ---
router.get("/policy/config", (req, res) => {
  const entity = req.query.entity as string;
  const config = policyConfigs[entity];
  res.json(config || {
    watchlists: [], confidenceThreshold: 75,
    customRules: [], sources: { sanctions: true, media: true, pep: true, corporate: true }
  });
});

router.post("/policy/config", (req, res) => {
  const { entity, config } = req.body;
  policyConfigs[entity] = config;
  globalAuditLogs.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    entity,
    action: "Updated configuration",
    user: "Admin User",
    details: config
  });
  res.json({ success: true });
});

router.get("/policy/audit-logs", (req, res) => {
  const entity = req.query.entity as string;
  const logs = globalAuditLogs.filter(log => log.entity === entity);
  res.json(logs);
});

router.get("/unified-records", (req, res) => {
  res.json([
    {
      id: "REC-001",
      entityName: "Global Trading Co",
      type: "Corporate",
      riskScore: 85,
      sources: ["OFAC", "Adverse Media", "Corporate Registry"],
      lastUpdated: new Date().toISOString(),
      matchConfidence: 94
    },
    {
      id: "REC-002",
      entityName: "John Smith",
      type: "Individual",
      riskScore: 42,
      sources: ["PEP List", "Watchlist"],
      lastUpdated: new Date().toISOString(),
      matchConfidence: 78
    }
  ]);
});

export default router;
