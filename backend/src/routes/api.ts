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
  const user = users.find((u) => u.email === email && password === "Sentinel_Test_Password_2026!@#");
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
    { id: "ENT-AAPL", name: "Apple Inc", type: "Public", dob: "1976-04-01", country: "US", risk: "Low", onboarded: "Pending", payload: { fiscalYear: "2023", employees: 161000, annualRevenue: 383285000000, industry: "Consumer Electronics", phone: "(408) 996-1010", companyType: "Public", description: "Apple Inc. is an American multinational technology company headquartered in Cupertino, California, in Silicon Valley, and known for consumer electronics, software and online services." } },
    { id: "ENT-BMR", name: "B & M Retail Limited", type: "Public", dob: "1978-03-14", country: "Jersey", risk: "Medium", onboarded: "Pending", payload: { fiscalYear: "2023", employees: 35000, annualRevenue: 4983000000, industry: "Retail", phone: "+44 151 728 5400", companyType: "Private", description: "B&M European Value Retail S.A. is a British variety store value retail chain, trading as B&M." } },
    { id: "ENT-BOY", name: "Bodycote PLC", type: "Public", dob: "1923-01-01", country: "UK", risk: "Low", onboarded: "Pending", payload: { fiscalYear: "2023", employees: 4983, annualRevenue: 744000000, industry: "Industrial Engineering", phone: "+44 1625 505300", companyType: "Public", description: "Bodycote plc is a supplier of metallurgical services, headquartered in Macclesfield, United Kingdom." } },
    { id: "ENT-BP", name: "BP plc", type: "Public", dob: "1909-04-14", country: "UK", risk: "Critical", onboarded: "Pending", payload: { fiscalYear: "2023", employees: 67600, annualRevenue: 241000000000, industry: "Oil & Gas", phone: "+44 20 7496 4000", companyType: "Public", description: "BP p.l.c. is a British multinational oil and gas company headquartered in London, England. It is one of the oil and gas supermajors." } },
    { id: "ENT-CLDN", name: "Caledonia Investments plc", type: "Public", dob: "1928-01-01", country: "UK", risk: "Low", onboarded: "Pending", payload: { fiscalYear: "2023", employees: 45, annualRevenue: 154000000, industry: "Investment Trust", phone: "+44 20 7802 8080", companyType: "Public", description: "Caledonia Investments plc is a British investment trust headquartered in London, England." } }
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
