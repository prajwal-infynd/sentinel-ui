import { Router } from "express";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";
import crypto from "crypto";

// In-memory only (MVP) — everything starts fresh on each server restart.
const myCache = new NodeCache({ stdTTL: 0 }); // no expiry while the process runs

function setCroftzAlerts(alerts: any[]) {
  myCache.set("croftz_alerts", alerts);
}
function setScreening(screeningId: string, data: any) {
  myCache.set(`screening_${screeningId}`, data);
}
function setInvestigation(investigationId: string, data: any) {
  myCache.set(`investigation_${investigationId}`, data);
}

const CROFTZ_KEY = "sk_0d514a86648edbc36840257f3303ea6fd65874b0cad898cd913199d10f0a4b0d";
const AGENT_CHAT_URL = "https://devstudio.27x.ai/api/v1/agents/c8c10d95-27a5-4ada-9ffb-ef00a4b22c6a/chat";
const AGENT_CHAT_KEY = "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_a5d822ca-4e36-42a3-8f4c-4c660db847ad__pllbvogOhiPt5TrzNFcFeCrGT7r3KfPKvX6yzLpXhw";
const AGENT_POLL_KEY = "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_c606a23d-d21e-4935-9a7e-f32efdcc4125_p_NR0R0MQVMPOpa7HmjnyXV0UFEX1yi5TCypF-gKGYI";
// Key used for portfolio enrichment (company add flow) — separate from investigation flow
const PORTFOLIO_AGENT_KEY = "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_a9048072-0b88-4a63-9783-15672fbbaa7f_EhvvQ_Zvd6cXx0lfwgtDq6yQKHwlJ6jbQKZ_xvkMLG0";
const SCRAPE_URL = "http://173.249.56.10:3000/page-source";

// Statuses that devstudio may return when a job finishes
const DONE_STATUSES = new Set(["completed", "complete", "success", "done", "finished"]);
const FAIL_STATUSES = new Set(["failed", "error", "cancelled", "canceled"]);

function parseAgentReply(raw: any): any {
  let reply = raw?.result?.reply ?? raw?.result?.data ?? raw?.result ?? raw?.data?.reply ?? raw?.data;
  if (typeof reply === "string") {
    try { reply = JSON.parse(reply.replace(/```json/gi, "").replace(/```/g, "").trim()); } catch { }
  }
  return reply;
}

// Max time a devstudio job may stay "processing" before we treat it as a stuck zombie.
// Real jobs finish in 30-90s; this generous cap only catches jobs devstudio never transitions
// (e.g. updated_at stays null / agent hung). Anchored to devstudio's own created_at when present.
const MAX_JOB_AGE_MS = 8 * 60 * 1000; // 8 minutes

async function pollAgentStatus(trackingId: string, key: string, label: string): Promise<any> {
  const pollUrl = `https://devstudio.27x.ai/api/v1/agents/chat/status/${trackingId}`;
  const pollStart = Date.now();
  while (true) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const pollResp = await fetch(pollUrl, { headers: { "x-api-key": key } });
      const pollData = await pollResp.json();
      const st = String(pollData.status ?? "").toLowerCase();
      console.log(`[${label}] poll status=${st} step=${pollData.current_step ?? "?"} trackingId=${trackingId}`);
      if (DONE_STATUSES.has(st)) return pollData;
      if (FAIL_STATUSES.has(st)) throw new Error(`Agent ${label} failed: ${st}`);

      // Staleness guard: anchor age to devstudio's created_at if available, else to our poll start.
      let ageMs = Date.now() - pollStart;
      if (pollData.created_at) {
        const createdMs = Date.parse(pollData.created_at.endsWith("Z") ? pollData.created_at : pollData.created_at + "Z");
        if (!Number.isNaN(createdMs)) ageMs = Date.now() - createdMs;
      }
      if (ageMs > MAX_JOB_AGE_MS) {
        throw new Error(`Agent ${label} stuck in "${st}" for ${Math.round(ageMs / 1000)}s (devstudio job did not complete)`);
      }
    } catch (err: any) {
      if (err.message?.startsWith("Agent ")) throw err;
      console.warn(`[${label}] poll network error, retrying:`, err.message);
    }
  }
}

async function processInvestigation(investigationId: string, alert: any, crawlData: any) {
  try {
    const current = (myCache.get(`investigation_${investigationId}`) as any) || {};
    let trackingId: string | undefined = current.trackingId;

    // If we already have a trackingId (e.g. resuming after a restart), skip straight to polling.
    if (!trackingId) {
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

      // Step 3: Call AI agent — returns a tracking_id quickly
      const agentResp = await fetch(AGENT_CHAT_URL, {
        method: "POST",
        headers: { "X-API-Key": AGENT_CHAT_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: [], stream: false, enable_thinking: false, tracking: true })
      });
      const agentData = await agentResp.json();
      trackingId = agentData.tracking_id;
      if (!trackingId) throw new Error("No tracking_id from agent");
      console.log(`[Investigation] ${investigationId} → trackingId=${trackingId}`);

      // Persist trackingId immediately so a restart can resume polling instead of re-running the agent.
      setInvestigation(investigationId, { ...current, status: "processing", trackingId, alert });
    } else {
      console.log(`[Investigation] ${investigationId} resuming poll with existing trackingId=${trackingId}`);
    }

    // Step 4: Poll until done
    const pollResult = await pollAgentStatus(trackingId, AGENT_POLL_KEY, "investigation");
    const existing = (myCache.get(`investigation_${investigationId}`) as any) || {};
    const reply = parseAgentReply(pollResult);

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
    console.log(`[Investigation] ${investigationId} → completed`);
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

    const pollResult = await pollAgentStatus(trackingId, PORTFOLIO_AGENT_KEY, "portfolio-enrich");
    return res.json({ result: parseAgentReply(pollResult) });
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

// --- Proxy for AI Agent ---
router.post("/chat", async (req, res) => {
  try {
    const { message, history, stream, enable_thinking } = req.body;

    const response = await fetch("https://devstudio.27x.ai/api/v1/agents/24a5ac86-de0c-4621-8809-5bf23b7b4ce5/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "ifk_0aee4bb8-832b-4fdb-b521-8df8e8cdea4e_c6f80be7-6371-465e-ae32-6b7d2e11ec84_Dw5QHAZok3ysPWvTYVZ_yvgVMY8gAW1fuV-HDggKCkM"
      },
      body: JSON.stringify({ message, history, stream, enable_thinking })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from agent API" });
    }

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      if (!response.body) {
        return res.status(500).json({ error: "No response body from agent API" });
      }

      const reader = response.body.getReader();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          res.write(value);
        }
      }
      res.end();
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error("Error proxying chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Crawler Proxy ---
router.post("/v1/crawler/extract-company-info", async (req, res) => {
  try {
    const { domains, company_name } = req.body;

    const payload: any = { domains };
    if (company_name) {
      payload.company_name = company_name;
    }
    const crawlerUrl = "http://173.249.56.10:1234/api/v1/crawler/extract-company-info";

    const response = await fetch(crawlerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from crawler API" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error proxying crawler request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Croftz Corporate Registry Screening Proxy ---
router.post("/croftz/corporate-registry-screening", async (req, res) => {
  try {
    const formData = new URLSearchParams(req.body as Record<string, string>);
    const postResp = await fetch("https://croftzgo.com/api/v1/corporate-registry-screening", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-api-key": CROFTZ_KEY
      },
      body: formData.toString()
    });
    const postData = await postResp.json();
    res.status(postResp.status).json(postData);
  } catch (error) {
    console.error("Error proxying Croftz POST:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/croftz/corporate-registry-screening", async (req, res) => {
  try {
    const crScreeningUid = req.query.crScreeningUid;
    const url = crScreeningUid
      ? `https://croftzgo.com/api/v1/corporate-registry-screening?crScreeningUid=${crScreeningUid}`
      : "https://croftzgo.com/api/v1/corporate-registry-screening";

    const getResp = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": CROFTZ_KEY
      }
    });
    const getData = await getResp.json();
    res.status(getResp.status).json(getData);
  } catch (error) {
    console.error("Error proxying Croftz GET:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
