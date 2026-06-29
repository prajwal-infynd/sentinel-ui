import { Router } from "express";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";
import crypto from "crypto";

const myCache = new NodeCache({ stdTTL: 0 }); // no expiry for MVP

// ── File-backed persistence (survives server restarts) ──────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const ALERTS_FILE = path.join(DATA_DIR, "croftz_alerts.json");
const SCREENINGS_FILE = path.join(DATA_DIR, "screenings.json");
const INVESTIGATIONS_FILE = path.join(DATA_DIR, "investigations.json");

function loadJSON<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function saveJSON(file: string, data: any) {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch (e) { console.error("[persist] write failed:", e); }
}

// Warm the cache from disk on startup
const _alerts = loadJSON<any[]>(ALERTS_FILE, []);
if (_alerts.length) myCache.set("croftz_alerts", _alerts);

const _screenings = loadJSON<Record<string, any>>(SCREENINGS_FILE, {});
Object.entries(_screenings).forEach(([k, v]) => myCache.set(`screening_${k}`, v));

const _investigations = loadJSON<Record<string, any>>(INVESTIGATIONS_FILE, {});
Object.entries(_investigations).forEach(([k, v]) => myCache.set(`investigation_${k}`, v));

// Wrappers: write to cache + sync to disk atomically
function setCroftzAlerts(alerts: any[]) {
  myCache.set("croftz_alerts", alerts);
  saveJSON(ALERTS_FILE, alerts);
}
function setScreening(screeningId: string, data: any) {
  myCache.set(`screening_${screeningId}`, data);
  const all = loadJSON<Record<string, any>>(SCREENINGS_FILE, {});
  all[screeningId] = data;
  saveJSON(SCREENINGS_FILE, all);
}
function setInvestigation(investigationId: string, data: any) {
  myCache.set(`investigation_${investigationId}`, data);
  const all = loadJSON<Record<string, any>>(INVESTIGATIONS_FILE, {});
  all[investigationId] = data;
  saveJSON(INVESTIGATIONS_FILE, all);
}
// ────────────────────────────────────────────────────────────────────────────

const CROFTZ_KEY = "sk_0d514a86648edbc36840257f3303ea6fd65874b0cad898cd913199d10f0a4b0d";
const AGENT_CHAT_URL = "https://devstudio.27x.ai/api/v1/agents/c8c10d95-27a5-4ada-9ffb-ef00a4b22c6a/chat";
const AGENT_CHAT_KEY = "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_a5d822ca-4e36-42a3-8f4c-4c660db847ad__pllbvogOhiPt5TrzNFcFeCrGT7r3KfPKvX6yzLpXhw";
const AGENT_POLL_KEY = "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_c606a23d-d21e-4935-9a7e-f32efdcc4125_p_NR0R0MQVMPOpa7HmjnyXV0UFEX1yi5TCypF-gKGYI";
// Key used for portfolio enrichment (company add flow) — separate from investigation flow
const PORTFOLIO_AGENT_KEY = "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_a9048072-0b88-4a63-9783-15672fbbaa7f_EhvvQ_Zvd6cXx0lfwgtDq6yQKHwlJ6jbQKZ_xvkMLG0";
const SCRAPE_URL = "http://173.249.56.10:3000/page-source";

async function processInvestigation(investigationId: string, alert: any, crawlData: any) {
  try {
    // Step 1: Scrape the news page
    let scrapedData: any = null;
    if (alert.link) {
      try {
        const newsHostname = new URL(alert.link).hostname.replace(/^www\./, "");
        const scrapeResp = await fetch(SCRAPE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domains: [newsHostname] }),
          signal: AbortSignal.timeout(30000)
        });
        scrapedData = await scrapeResp.json();
      } catch (scrapeErr) {
        console.error("[Investigation] Scrape failed:", scrapeErr);
      }
    }

    // Step 2: Build AI agent message
    const message = JSON.stringify({
      crawlData: crawlData || {},
      scrapedNewsData: scrapedData,
      adverseMediaAlert: {
        title: alert.title,
        description: alert.description,
        link: alert.link,
        sentiment: alert.sentiment,
        adverseKeywords: alert.adverseKeywords,
        publicationDate: alert.publicationDate,
        companyName: alert.companyName,
        riskLevel: alert.riskLevel,
        riskScore: alert.riskScore
      }
    });

    // Step 3: Call AI agent (no timeout — just kicks off the job and returns tracking_id fast)
    const agentResp = await fetch(AGENT_CHAT_URL, {
      method: "POST",
      headers: { "X-API-Key": AGENT_CHAT_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: [], stream: false, enable_thinking: false, tracking: true })
    });
    const agentData = await agentResp.json();
    const trackingId = agentData.tracking_id;
    if (!trackingId) throw new Error("No tracking_id from agent");

    // Step 4: Poll every 2 seconds — no hard cap, just keep going until done
    const pollUrl = `https://devstudio.27x.ai/api/v1/agents/chat/status/${trackingId}`;
    let pollResult: any = null;
    while (true) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const pollResp = await fetch(pollUrl, { headers: { "x-api-key": AGENT_POLL_KEY } });
        const pollData = await pollResp.json();
        if (pollData.status === "completed") { pollResult = pollData; break; }
        if (pollData.status === "failed" || pollData.status === "error") {
          throw new Error(`Agent failed with status: ${pollData.status}`);
        }
      } catch (pollErr: any) {
        if (pollErr.message?.startsWith("Agent failed")) throw pollErr;
        // network hiccup — retry
      }
    }

    const existing = (myCache.get(`investigation_${investigationId}`) as any) || {};

    // Parse reply — agent may return JSON string
    let reply = pollResult.result?.reply || pollResult.result;
    if (typeof reply === "string") { try { reply = JSON.parse(reply); } catch {} }

    const screening = myCache.get(`screening_${alert.screeningId}`) as any;
    setInvestigation(investigationId, {
      ...existing,
      status: "completed",
      data: reply,
      rawResult: pollResult.result,
      alert,
      adverseMedia: screening?.adverseMedia || [],
      screeningData: screening?.screeningData || null,
      completedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[Investigation] Processing error:", err);
    const existing = (myCache.get(`investigation_${investigationId}`) as any) || {};
    setInvestigation(investigationId, { ...existing, status: "error", error: String(err) });
  }
}
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


// --- Adverse Media Screening (Croftz) ---
router.post("/screening/adverse-media", async (req, res) => {
  const { name, crawlData } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const screeningId = crypto.randomUUID();

  try {
    const formData = new URLSearchParams({
      monitoringRenew: "false", exactMatch: "true", name, metadata: "",
      countryCodes: "", fuzzinessThreshold: "100", monitor: "false",
      birthYear: "", monitoringDuration: "60", entityType: "company"
    });

    const postResp = await fetch("https://croftzgo.com/api/v1/screening", {
      method: "POST",
      headers: { "accept": "application/json", "X-API-Key": CROFTZ_KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      signal: AbortSignal.timeout(30000)
    });
    if (!postResp.ok) throw new Error(`Croftz POST ${postResp.status}: ${await postResp.text()}`);
    const postData = await postResp.json();
    const postBody = postData.response || postData;
    const screeningUid = postBody.screening?.rowUid || postBody.screeningUid;

    let getBody: any = postBody;
    if (screeningUid) {
      const getResp = await fetch(`https://croftzgo.com/api/v1/screening?screeningUid=${screeningUid}`, {
        headers: { "accept": "application/json", "X-API-Key": CROFTZ_KEY },
        signal: AbortSignal.timeout(20000)
      });
      const getData = await getResp.json();
      getBody = getData.response || getData;
    }

    const screeningResults: any[] = getBody.screeningResults || postBody.screeningResults || [];
    const adverseMedia: any[] = screeningResults.flatMap((r: any) => r.results?.adverse_media || []);
    const firstResult = screeningResults[0]?.results || {};

    const alerts = adverseMedia.map((media: any) => {
      const score = typeof media.score === "number" ? media.score : -1;
      const severity = score <= -3 ? "critical" : score <= -2 ? "high" : "medium";
      return {
        id: crypto.randomUUID(), screeningId, screeningUid, companyName: name,
        title: media.title || "Adverse Media Alert",
        description: media.description || "",
        link: media.link || "",
        sentiment: media.sentiment || "negative",
        score, adverseKeywords: media.adverse_keywords || [],
        publicationDate: media.publication_date || new Date().toISOString(),
        country: media.country || null, thumbnail: media.thumbnail || "",
        riskLevel: firstResult.risk_level || "Medium",
        riskScore: firstResult.risk_score || 40,
        matchStatus: getBody.screening?.matchStatus || "Potential Match",
        // Alert-compatible fields
        severity, category: "Adverse Media",
        generated_at: new Date().toISOString(),
        monitored_entities: { name },
        summary: media.description || "Adverse media detected",
        source: "Croftz", investigationId: null
      };
    });

    setScreening(screeningId, {
      screeningId, screeningUid, companyName: name, crawlData,
      screeningData: getBody, adverseMedia, alerts, createdAt: new Date().toISOString()
    });

    const existingAlerts = (myCache.get("croftz_alerts") as any[]) || [];
    setCroftzAlerts([...alerts, ...existingAlerts]);

    res.json({ screeningId, alertCount: alerts.length, alerts });
  } catch (err) {
    console.error("[Screening] Error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- Start Investigation from Croftz Alert ---
router.post("/investigations/start", async (req, res) => {
  const { alertId } = req.body;
  if (!alertId) return res.status(400).json({ error: "alertId required" });

  const croftzAlerts = (myCache.get("croftz_alerts") as any[]) || [];
  const alert = croftzAlerts.find((a: any) => a.id === alertId);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  if (alert.investigationId) {
    return res.json({ investigationId: alert.investigationId, status: "existing" });
  }

  const investigationId = crypto.randomUUID();
  setInvestigation(investigationId, {
    status: "pending", alertId, companyName: alert.companyName,
    alert, createdAt: new Date().toISOString()
  });

  setCroftzAlerts(croftzAlerts.map((a: any) =>
    a.id === alertId ? { ...a, investigationId } : a
  ));

  res.json({ investigationId, status: "pending" });

  const screening = (myCache.get(`screening_${alert.screeningId}`) as any);
  processInvestigation(investigationId, alert, screening?.crawlData).catch(console.error);
});

// --- Investigation Status ---
router.get("/investigations/status/:id", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  const inv = myCache.get(`investigation_${req.params.id}`) as any;
  if (!inv) return res.status(404).json({ error: "Not found" });
  res.json({ status: inv.status, error: inv.error || null });
});

// --- Investigation Data ---
router.get("/investigations/data/:id", (req, res) => {
  const inv = myCache.get(`investigation_${req.params.id}`) as any;
  if (!inv) return res.status(404).json({ error: "Not found" });
  res.json(inv);
});

// --- Portfolio Agent Enrichment (proxy — keeps API key off the browser) ---
router.post("/agent/portfolio-enrich", async (req, res) => {
  const { crawlerData } = req.body;
  if (!crawlerData) return res.status(400).json({ error: "crawlerData required" });

  try {
    const agentResp = await fetch(AGENT_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": PORTFOLIO_AGENT_KEY },
      body: JSON.stringify({ message: JSON.stringify(crawlerData), tracking: true })
    });
    if (!agentResp.ok) throw new Error(`Agent POST failed: ${agentResp.status}`);
    const agentData = await agentResp.json();
    const trackingId = agentData.tracking_id;
    if (!trackingId) throw new Error("No tracking_id from agent");

    const pollUrl = `https://devstudio.27x.ai/api/v1/agents/chat/status/${trackingId}`;
    while (true) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const pollResp = await fetch(pollUrl, { headers: { "x-api-key": PORTFOLIO_AGENT_KEY } });
        const pollData = await pollResp.json();
        if (pollData.status === "completed" || pollData.status === "complete") {
          let reply = pollData.result?.reply || pollData.result;
          if (typeof reply === "string") {
            try { reply = JSON.parse(reply.replace(/```json/gi, "").replace(/```/g, "").trim()); } catch {}
          }
          return res.json({ result: reply });
        }
        if (pollData.status === "error" || pollData.status === "failed") {
          throw new Error("Agent processing failed");
        }
      } catch (pollErr: any) {
        if (pollErr.message === "Agent processing failed") throw pollErr;
        // transient network hiccup — retry next iteration
      }
    }
  } catch (err) {
    console.error("[Portfolio Enrich] Error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- Alerts and Agents ---
router.get("/alerts", (req, res) => {
  const croftzAlerts = (myCache.get("croftz_alerts") as any[]) || [];
  res.json(croftzAlerts);
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
