import { Router } from "express";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

const myCache = new NodeCache();
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
  dashboardSummary.entityCount += importCount;
  
  // Persist imported entities into node-cache
  const existingCache: any[] = myCache.get("crawled_entities") || [];
  const newEntities = Array.isArray(rows) ? rows : [rows];
  
  // Format them for the frontend the same way as sample-preview
  const formattedNew = newEntities.map(row => ({
    masterEntityProfile: {
      fullName: row.name,
      jurisdiction: row.jurisdiction,
      financials: { sector: row.identifiers?.sector, revenue: row.identifiers?.revenue },
      ...row.rawIdentifiers
    },
    ...row
  }));
  
  myCache.set("crawled_entities", [...formattedNew, ...existingCache]);
  
  res.json({ imported: importCount });
});
router.get("/portfolio/sample-preview", (req, res) => {
  try {
    let dataPath = path.join(process.cwd(), "consolidated_entities.json");
    if (!fs.existsSync(dataPath)) {
      dataPath = path.join(process.cwd(), "..", "consolidated_entities.json");
    }
    
    const rawData = fs.readFileSync(dataPath, "utf8");
    const parsedData = JSON.parse(rawData);
    
    // The frontend expects an array of objects shaped { masterEntityProfile: { ... } }
    const formattedData = (parsedData.masterEntityProfiles || []).map((profile: any) => ({
      masterEntityProfile: profile
    }));
    
    const cachedEntities = (myCache.get("crawled_entities") as any[]) || [];
    
    res.json([...cachedEntities, ...formattedData]);
  } catch (err) {
    console.error("Error reading consolidated_entities.json:", err);
    res.status(500).json({ error: "Failed to load sample data" });
  }
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
