import MockAdapter from "axios-mock-adapter";
import { apiClient } from "./api-client";
import { formatRelativeTime } from "./utils";

// Initialize mock adapter
export const mock = new MockAdapter(apiClient, { delayResponse: 500 }); // simulate network delay

// --- AUTH & USERS DATA ---
export const ROLES = {
  1: { id: 1, name: "Super Admin", basePermissions: ["admin:*"] },
  2: { id: 2, name: "Owner", basePermissions: ["invite_user", "manage_subscription", "crud:*"] },
  3: { id: 3, name: "User", basePermissions: ["crud:*"] },
  4: { id: 4, name: "Trial User", basePermissions: ["manage_subscription", "crud:*"] },
};

let mockUsers = [
  { id: 1, name: "Super Admin User", roleId: 1, email: "superadmin@sentinel.com", password: "password", allowedPermissions: [], deniedPermissions: [], tokensUsed: "1.2M", cost: "$24.00", status: "Active" },
  { id: 2, name: "Owner User", roleId: 2, email: "owner@sentinel.com", password: "password", allowedPermissions: [], deniedPermissions: [], tokensUsed: "850k", cost: "$17.00", status: "Active" },
  { id: 3, name: "Standard User", roleId: 3, email: "user@sentinel.com", password: "password", allowedPermissions: [], deniedPermissions: [], tokensUsed: "2.1M", cost: "$42.00", status: "Active" },
];

const computePermissions = (user: any) => {
  const role = ROLES[user.roleId as keyof typeof ROLES];
  if (!role) return [];
  const permissions = new Set([...role.basePermissions, ...(user.allowedPermissions || [])]);
  for (const denied of (user.deniedPermissions || [])) {
    permissions.delete(denied);
  }
  return Array.from(permissions);
};

mock.onPost("/auth/login").reply((config) => {
  const { email, password } = JSON.parse(config.data);
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return [200, { user: { ...userWithoutPassword, role: ROLES[user.roleId as keyof typeof ROLES]?.name, computedPermissions: computePermissions(user) } }];
  }
  return [401, { message: "Invalid email or password" }];
});

mock.onPost("/auth/signup").reply((config) => {
  const { name, email, password } = JSON.parse(config.data);
  if (mockUsers.some(u => u.email === email)) {
    return [400, { message: "Email already exists" }];
  }
  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    password,
    roleId: 4, // Default to Trial User
    allowedPermissions: [],
    deniedPermissions: [],
    tokensUsed: "0",
    cost: "$0.00",
    status: "Active",
  };
  mockUsers.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return [200, { user: { ...userWithoutPassword, role: ROLES[newUser.roleId as keyof typeof ROLES]?.name, computedPermissions: computePermissions(newUser) } }];
});

mock.onGet("/admin/users").reply(() => {
  const safeUsers = mockUsers.map((user) => {
    const { password, ...rest } = user;
    return {
      ...rest,
      role: ROLES[user.roleId as keyof typeof ROLES]?.name,
      permissions: computePermissions(user)
    };
  });
  return [200, safeUsers];
});

mock.onPost("/admin/users/invite").reply((config) => {
  const { name, email, roleId, allowedPermissions } = JSON.parse(config.data);
  if (mockUsers.some(u => u.email === email)) {
    return [400, { message: "Email already exists" }];
  }
  const newUser = {
    id: mockUsers.length + 1,
    name: name || email.split('@')[0],
    email,
    password: "password", // default password for mock
    roleId: roleId || 3, // Default to User if not provided
    allowedPermissions: allowedPermissions || [],
    deniedPermissions: [],
    tokensUsed: "0",
    cost: "$0.00",
    status: "Active",
  };
  mockUsers.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return [200, { user: { ...userWithoutPassword, role: ROLES[newUser.roleId as keyof typeof ROLES]?.name, permissions: computePermissions(newUser) } }];
});

mock.onPatch(/\/admin\/users\/.+\/status/).reply((config) => {
  const match = config.url?.match(/\/admin\/users\/(.+)\/status/);
  if (match) {
    const id = parseInt(match[1]);
    const { status } = JSON.parse(config.data);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsers[userIndex].status = status;
      return [200, { success: true }];
    }
  }
  return [404, { message: "User not found" }];
});

mock.onDelete(/\/admin\/users\/.+/).reply((config) => {
  const match = config.url?.match(/\/admin\/users\/(.+)/);
  if (match) {
    const id = parseInt(match[1]);
    mockUsers = mockUsers.filter(u => u.id !== id);
    return [200, { success: true }];
  }
  return [404, { message: "User not found" }];
});


// --- DASHBOARD DATA ---
let dashboardSummary = {
  organizationName: "Monitoring Workspace",
  entityCount: 5,
  alertCount: 0,
  highRiskAlertCount: 0,
  articleCount: 0,
  openCaseCount: 0,
  avgRiskScore: 0,
  activeAgentRuns: 0,
};

mock.onGet("/dashboard/summary").reply(() => [200, dashboardSummary]);

let mockEntities: any[] = [
  {
    id: "ENT-AAPL",
    name: "Apple Inc",
    entity_type: "company",
    jurisdiction: "US",
    risk_score: 12,
    latest_signal: "No new signals",
    last_screened_at: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "ENT-BMR",
    name: "B & M Retail Limited",
    entity_type: "company",
    jurisdiction: "Jersey",
    risk_score: 45,
    latest_signal: "Routine check",
    last_screened_at: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "ENT-BOY",
    name: "Bodycote PLC",
    entity_type: "company",
    jurisdiction: "UK",
    risk_score: 28,
    latest_signal: "No new signals",
    last_screened_at: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "ENT-BP",
    name: "BP plc",
    entity_type: "company",
    jurisdiction: "UK",
    risk_score: 88,
    latest_signal: "Adverse media - environmental",
    last_screened_at: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "ENT-CLDN",
    name: "Caledonia Investments plc",
    entity_type: "company",
    jurisdiction: "UK",
    risk_score: 15,
    latest_signal: "Routine check",
    last_screened_at: new Date().toISOString(),
    status: "Active"
  }
];

mock.onGet("/portfolio/entities").reply(() => [200, mockEntities]);

mock.onPatch(/\/portfolio\/entities\/.+\/status/).reply((config) => {
  const match = config.url?.match(/\/portfolio\/entities\/(.+)\/status/);
  if (match) {
    const id = match[1];
    const { status } = JSON.parse(config.data);
    
    if (id === "activate-all") {
      mockEntities.forEach(e => {
        if (e.status === "Inactive") e.status = "Active";
      });
      return [200, mockEntities];
    }
    if (id === "deactivate-all") {
      mockEntities.forEach(e => {
        if (e.status === "Active") e.status = "Inactive";
      });
      return [200, mockEntities];
    }

    const entityIndex = mockEntities.findIndex(e => e.id === id);
    if (entityIndex !== -1) {
      mockEntities[entityIndex] = { ...mockEntities[entityIndex], status };
      return [200, mockEntities[entityIndex]];
    }
  }
  return [404, { message: "Entity not found" }];
});

mock.onPatch(/\/portfolio\/entities\/.+\/kyb-status/).reply((config) => {
  const match = config.url?.match(/\/portfolio\/entities\/(.+)\/kyb-status/);
  if (match) {
    const id = match[1];
    const { kyb_status } = JSON.parse(config.data);
    
    const entityIndex = mockEntities.findIndex(e => e.id === id);
    if (entityIndex !== -1) {
      mockEntities[entityIndex].kyb_status = kyb_status;
      return [200, mockEntities[entityIndex]];
    }
    return [404, { error: "Not found" }];
  }
  return [400, { error: "Invalid Request" }];
});

mock.onGet("/alerts").reply(200, [
  { id: "a1", category: "Sanctions", title: "Sanctions Match", summary: "Entity matched with OFAC sanctions list.", severity: "critical", generated_at: new Date().toISOString(), confidence_score: 95, status: "open", monitored_entities: { name: "John Doe" }, media_articles: { headline: "John Doe added to sanctions list" } },
  { id: "a2", category: "Adverse Media", title: "Adverse Media", summary: "Negative news regarding fraud allegations.", severity: "high", generated_at: new Date(Date.now() - 3600000).toISOString(), confidence_score: 88, status: "investigating", monitored_entities: { name: "Acme Corp" }, media_articles: { headline: "Acme Corp under investigation for fraud" } },
  { id: "a3", category: "Sanctions", title: "Suspected sanctions evasion network", summary: "Vladimir Sokolov linked to shell company network in Cyprus", severity: "critical", generated_at: new Date(Date.now() - 60000).toISOString(), confidence_score: 91, status: "open", monitored_entities: { name: "Vladimir Sokolov" }, media_articles: { headline: "Cyprus shell companies tied to sanctioned individuals" } },
  { id: "a5", category: "Sanctions", title: "State-Sponsored Cyber Activity Detected", summary: "Entity identified as a front for Russian intelligence cyber operations targeting financial infrastructure.", severity: "critical", generated_at: new Date(Date.now() - 45000).toISOString(), confidence_score: 98, status: "open", monitored_entities: { name: "Novosibirsk Logistics Ltd" }, media_articles: { headline: "Treasury sanctions cyber warfare fronts" } },
  { id: "a6", category: "Adverse Media", title: "Cartel Front Company Allegations", summary: "Mexican agribusiness flagged for laundering illicit narcotics proceeds through shell networks.", severity: "critical", generated_at: new Date(Date.now() - 120000).toISOString(), confidence_score: 96, status: "investigating", monitored_entities: { name: "Sinaloa Agribusiness Corp" }, media_articles: { headline: "DOJ indicts massive cartel laundering ring" } },
  { id: "a9", category: "Corporate Event", title: "Bankruptcy Filing Detected", summary: "TechNova Corp files for Chapter 11 bankruptcy. Immediate exposure review required.", severity: "high", generated_at: new Date(Date.now() - 200000).toISOString(), confidence_score: 99, status: "open", monitored_entities: { name: "TechNova Corp" }, media_articles: { headline: "TechNova Corp declares bankruptcy amidst financial turmoil" } },
  { id: "a10", category: "Corporate Event", title: "Company Status Changed: Dissolved", summary: "Global Imports Ltd status changed to Dissolved. Still actively monitored for residual entity activity.", severity: "medium", generated_at: new Date(Date.now() - 250000).toISOString(), confidence_score: 100, status: "open", monitored_entities: { name: "Global Imports Ltd" }, media_articles: { headline: "Corporate Registry Update: Global Imports Ltd Dissolved" } },
  { id: "a11", category: "Legal", title: "Legal Proceedings Detected", summary: "Regulatory action and class-action lawsuit filed against Acme Corp by the SEC.", severity: "high", generated_at: new Date(Date.now() - 300000).toISOString(), confidence_score: 95, status: "investigating", monitored_entities: { name: "Acme Corp" }, media_articles: { headline: "SEC files charges against Acme Corp executives" } },
  { id: "a12", category: "Corporate Event", title: "Ownership Change Detected", summary: "Major shareholder change detected for Desert Sands Construction. New UBO identified.", severity: "medium", generated_at: new Date(Date.now() - 500000).toISOString(), confidence_score: 92, status: "open", monitored_entities: { name: "Desert Sands Construction" }, media_articles: { headline: "Desert Sands acquired in majority stake buyout" } },
]);

mock.onGet("/agents/runs").reply(200, [
  { id: "r1", agent_name: "News Crawler", stage: "Extraction", status: "running", started_at: new Date().toISOString(), details: { summary: "Crawling latest financial news" }, output_count: 15, average_confidence: 85 },
  { id: "r2", agent_name: "Entity Matcher", stage: "Matching", status: "completed", started_at: new Date(Date.now() - 7200000).toISOString(), details: { summary: "Matched 150 entities" }, output_count: 150, average_confidence: 92 },
  { id: "r3", agent_name: "Risk Scorer", stage: "Scoring", status: "running", started_at: new Date(Date.now() - 300000).toISOString(), details: { summary: "Calculating proximity scores for Russian logistics network" }, output_count: 42, average_confidence: 88 },
  { id: "r4", agent_name: "Network Analyzer", stage: "Graph Analysis", status: "running", started_at: new Date(Date.now() - 600000).toISOString(), details: { summary: "Mapping cartel money laundering typologies" }, output_count: 12, average_confidence: 96 },
]);

mock.onGet("/investigations/snapshot").reply(200, {
  alert: {
    id: "a5", title: "State-Sponsored Cyber Activity Detected", summary: "Entity identified as a front for Russian intelligence cyber operations targeting financial infrastructure. Critical match against Treasury OFAC Cyber Sanctions program.", severity: "critical", generated_at: new Date().toISOString(), confidence_score: 98, status: "open", monitored_entities: { name: "Novosibirsk Logistics Ltd" }, media_articles: { headline: "Treasury sanctions cyber warfare fronts" }, risk_signals: [{ category: "Sanctions", confidence_score: 98 }, { category: "Cybersecurity", confidence_score: 99 }]
  },
  caseRecord: { id: "c1", status: "open", opened_at: new Date(Date.now() - 86400000).toISOString(), title: "Investigation into Novosibirsk Cyber Network" },
  notes: [
    { id: "n1", body: "Initial review started. Awaiting further documentation from the cyber threat intelligence team regarding the IP routing through this logistics firm.", created_at: new Date(Date.now() - 80000000).toISOString() },
    { id: "n2", body: "CRITICAL: External threat intelligence confirms that Novosibirsk Logistics Ltd is a confirmed shell company operating on behalf of APT29. They are facilitating server payments for malware C2 infrastructure.", created_at: new Date(Date.now() - 40000000).toISOString() },
    { id: "n3", body: "Escalating to FinCEN and filing a SAR immediately. Freezing all associated accounts connected to their Singapore subsidiary.", created_at: new Date().toISOString() }
  ],
});

mock.onPost("/portfolio/import").reply((config) => {
  try {
    const rows = JSON.parse(config.data);
    const importCount = Array.isArray(rows) ? rows.length : 1;
    
    // For demo purposes, we replace the dashboard count with the exact number of entities imported
    dashboardSummary.entityCount = importCount;
    
    // Replace the portfolio list with the newly imported entities
    mockEntities = (Array.isArray(rows) ? rows : [rows]).map((r: any, i: number) => ({
      id: r.externalReference || `new_${Date.now()}_${i}`,
      name: r.name || "Unknown Entity",
      entity_type: r.entityType || "company",
      jurisdiction: r.jurisdiction || "Unknown",
      risk_score: r.riskScore || 50,
      latest_signal: "Newly Imported",
      last_screened_at: new Date().toISOString(),
      status: "Active"
    }));

    return [200, { imported: importCount }];
  } catch (e) {
    return [200, { imported: 3 }];
  }
});

// --- MEDIA AGENT DATA ---

mock.onGet("/media/summary").reply(200, {
  sourcesScanned: 154, articlesProcessed: 4215, riskSignals: 892, highRiskAlerts: 42, entitiesImpacted: 118, falsePositiveRate: 12.5, avgConfidence: 88.4, activeAgents: 3
});

mock.onGet(/\/media\/articles.*/).reply((config) => {
  const limit = 8;
  const articles = Array.from({ length: limit }, (_, i) => ({
    id: `art_${i}`, headline: `Global Markets See Shift Following New Regulations ${i + 1}`, source: "Financial Times", timestamp: formatRelativeTime(new Date(Date.now() - i * 3600000).toISOString()), severity: i % 3 === 0 ? "high" : "medium", riskTags: ["Regulatory", "Market Shift"], riskScore: 85 - i * 5, entities: ["Acme Corp", "Regulator X"]
  }));
  return [200, articles];
});

mock.onGet(/\/media\/activity.*/).reply(200, Array.from({ length: 8 }, (_, i) => ({
  id: `act_${i}`, action: "News Crawler · Extraction", detail: `Extracted ${100 + i * 10} articles from sources`, status: i === 0 ? "active" : "completed", time: formatRelativeTime(new Date(Date.now() - i * 1800000).toISOString())
})));

mock.onGet("/media/signals-over-time").reply(() => {
  const points = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    points.push({ date: d.toLocaleDateString(undefined, { weekday: "short" }), signals: Math.floor(Math.random() * 50) + 10, alerts: Math.floor(Math.random() * 10) + 2 });
  }
  return [200, points];
});

mock.onGet("/media/risk-categories").reply(() => {
  const CATEGORY_COLORS = ["hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--muted-foreground))"];
  const categories = ["Sanctions", "Fraud", "Money Laundering", "Corruption", "Cybersecurity"];
  return [200, categories.map((cat, i) => ({ category: cat, count: Math.floor(Math.random() * 100) + 20, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))];
});

mock.onGet(/\/media\/alerts.*/).reply(200, Array.from({ length: 12 }, (_, i) => ({
  id: `alert_${i}`, severity: i % 4 === 0 ? "critical" : "high", title: `Adverse Media Mention - ${i + 1}`, summary: "High-priority media event generated by the monitoring pipeline.", generatedAt: new Date(Date.now() - i * 7200000).toISOString(), confidenceScore: 92 - i, status: "open", entityName: "Global Tech Inc.", articleHeadline: `Global Markets See Shift Following New Regulations ${i + 1}`
})));

mock.onGet("/media/agents-overview").reply(200, [
  { name: "News Crawler", status: "running", processed: 45000, signals: 1200, accuracy: 94, uptime: "99.9%", lastAction: "Crawling EU financial feeds" },
  { name: "NLP Extractor", status: "running", processed: 14200, signals: 890, accuracy: 96, uptime: "99.8%", lastAction: "Extracting named entities" },
  { name: "Entity Matcher", status: "completed", processed: 1200, signals: 45, accuracy: 89, uptime: "99.5%", lastAction: "Matched 45 entities" },
  { name: "Risk Scorer", status: "running", processed: 850, signals: 210, accuracy: 92, uptime: "99.9%", lastAction: "Calculating proximity scores" },
  { name: "Policy Engine", status: "paused", processed: 560, signals: 12, accuracy: 100, uptime: "99.9%", lastAction: "Waiting for threshold updates" },
  { name: "Alert Generator", status: "completed", processed: 210, signals: 210, accuracy: 99, uptime: "100%", lastAction: "Generated 12 new alerts" }
]);

mock.onGet(/\/media\/article\/.+/).reply(200, {
  id: "test", headline: "Global Markets See Shift Following New Regulations", source: "Financial Times", timestamp: formatRelativeTime(new Date().toISOString()), language: "English", credibilityScore: 95, severity: "high", content: "Detailed article content goes here. The markets have been shifting significantly due to recent regulatory changes. Global Tech Inc. and Acme Corp are reportedly facing increased scrutiny. Insider sources state that a recent fraud investigation could lead to massive fines. Representatives for Acme Corp stated they are 'fully assisting with inquiries'.", summary: "Automated agent summary: Regulatory changes cause market shift impacting several entities. Potential fraud investigation reported.", entities: ["Acme Corp", "Regulator X", "Global Tech Inc."], matchedEntity: "Acme Corp", matchConfidence: 88, riskScore: 75, riskTags: ["Regulatory", "Market Shift", "Fraud Investigation"], trace: [{ label: "Ingested", value: new Date().toLocaleString() }, { label: "Crawl method", value: "Automated workspace agent" }, { label: "Parser version", value: "Agent pipeline v2" }, { label: "Model version", value: "LLM-based heuristics" }, { label: "Signals generated", value: "3" }, { label: "Source URL", value: "https://example.com/article" }],
  debate: [
    { agent: "Investigator Agent", role: "Prosecution", message: "This article explicitly links 'Acme Corp' to a 'fraud investigation' and mentions 'massive fines'. This warrants a Critical risk score (90+) for immediate EDD.", timestamp: new Date(Date.now() - 50000).toLocaleTimeString() },
    { agent: "Skeptic Agent", role: "Defense", message: "I disagree. The article states they are 'reportedly facing scrutiny' and 'assisting with inquiries'. There are no formal charges or indictments yet. We should not trigger a Critical alert on rumor.", timestamp: new Date(Date.now() - 40000).toLocaleTimeString() },
    { agent: "Investigator Agent", role: "Prosecution", message: "But the credibility score of the source (Financial Times) is 95. The likelihood of this rumor being substantial is very high.", timestamp: new Date(Date.now() - 30000).toLocaleTimeString() },
    { agent: "Compliance Agent", role: "Judge", message: "Consensus reached. While the source is highly credible, formal charges have not been filed. However, 'assisting with inquiries' in a fraud context is a material risk. I am setting the Risk Score to 75 (High) and tagging it for manual review.", timestamp: new Date(Date.now() - 10000).toLocaleTimeString() }
  ]
});

mock.onPost("/media/agents/run").reply(200, { success: true, message: "Agent run initiated." });

// --- REPORTING DATA ---
mock.onGet("/reporting/metrics").reply(200, {
  monthlyAlerts: [
    { month: "Oct", alerts: 189 }, { month: "Nov", alerts: 204 }, { month: "Dec", alerts: 178 },
    { month: "Jan", alerts: 221 }, { month: "Feb", alerts: 195 }, { month: "Mar", alerts: 167 },
  ],
  fpReduction: [
    { month: "Oct", rate: 42 }, { month: "Nov", rate: 38 }, { month: "Dec", rate: 31 },
    { month: "Jan", rate: 25 }, { month: "Feb", rate: 19 }, { month: "Mar", rate: 14 },
  ],
  buAlerts: [
    { name: "Retail Banking", value: 45, color: "hsl(221 83% 53%)" },
    { name: "Corporate Banking", value: 28, color: "hsl(263 70% 58%)" },
    { name: "Wealth Management", value: 18, color: "hsl(38 92% 50%)" },
    { name: "Trade Finance", value: 9, color: "hsl(142 71% 45%)" },
  ],
  execKpis: [
    { label: "Portfolio Monitored", value: "12,847", iconName: "Users", trend: "+12%" },
    { label: "False Positive Reduction", value: "67%", iconName: "TrendingDown", trend: "↓ vs baseline" },
    { label: "Time Saved per Analyst", value: "4.2h/day", iconName: "Clock", trend: "+23%" },
    { label: "High-Risk Cases Open", value: "31", iconName: "AlertTriangle", trend: "-8 this week" },
    { label: "Confirmed Escalations", value: "12", iconName: "CheckCircle2", trend: "+3 this month" },
    { label: "SLA Compliance", value: "98.4%", iconName: "BarChart3", trend: "Above target" },
  ]
});

// --- DATA ARCHITECTURE DATA ---
mock.onGet("/architecture/info").reply(200, {
  pipelineSteps: [
    { label: "Raw Sources", iconName: "Database", desc: "350+ global sanctions & media feeds" },
    { label: "S3 Landing", iconName: "Layers", desc: "Raw data lake ingestion" },
    { label: "Parsing", iconName: "FileText", desc: "Format-specific extraction" },
    { label: "Standardisation", iconName: "GitBranch", desc: "Schema normalisation" },
    { label: "Delta Engine", iconName: "ArrowRight", desc: "Change detection" },
    { label: "MDM", iconName: "Shield", desc: "Master entity resolution" },
    { label: "Policy Layer", iconName: "Shield", desc: "Rule-based filtering" },
    { label: "Export / API", iconName: "Plug", desc: "Delivery & alerting" },
  ],
  features: [
    { title: "Raw + Cleansed Fields", desc: "Preserve original data alongside standardised output for full auditability" },
    { title: "Delta Updates", desc: "Track additions, modifications, and removals across every source revision" },
    { title: "Source Lineage", desc: "Full provenance chain from raw source to delivered record" },
    { title: "Auditability", desc: "Every transformation logged with timestamps and version identifiers" },
    { title: "MDM Entity Consolidation", desc: "Merge duplicate entities across sources into master records" },
    { title: "Policy-Based Selection", desc: "Configurable list inclusion/exclusion based on regulatory requirements" },
  ],
  schemaFields: [
    { field: "master_entity_id", type: "UUID", desc: "Unique consolidated entity identifier" },
    { field: "primary_name", type: "VARCHAR", desc: "Primary display name" },
    { field: "aliases", type: "JSONB", desc: "Array of known aliases and alternative spellings" },
    { field: "date_of_birth", type: "DATE", desc: "Date of birth or incorporation" },
    { field: "country", type: "VARCHAR", desc: "Primary jurisdiction" },
    { field: "identifiers", type: "JSONB", desc: "Passport, tax ID, registration numbers" },
    { field: "sanction_status", type: "ENUM", desc: "active | delisted | under_review" },
    { field: "source_names", type: "JSONB", desc: "Contributing source list names" },
    { field: "listed_date", type: "TIMESTAMP", desc: "Date first listed on any source" },
    { field: "updated_date", type: "TIMESTAMP", desc: "Last modification timestamp" },
    { field: "active_flag", type: "BOOLEAN", desc: "Current active/inactive status" },
  ]
});

// --- POLICY CONFIG DATA ---
let policyConfigData = {
  watchlists: [
    { name: "OFAC SDN List", region: "United States", enabled: true },
    { name: "EU Consolidated Sanctions", region: "European Union", enabled: true },
    { name: "UN Security Council", region: "International", enabled: true },
    { name: "UK HMT Sanctions", region: "United Kingdom", enabled: true },
    { name: "FATF High-Risk Jurisdictions", region: "International", enabled: false },
    { name: "Local Law Enforcement Notices", region: "Multi-jurisdiction", enabled: false },
    { name: "Interpol Red Notices", region: "International", enabled: true },
    { name: "World Bank Debarment List", region: "International", enabled: false },
  ],
  mediaCategories: [
    "Financial Crime", "Fraud", "Corruption", "Money Laundering", "Tax Evasion",
    "Terrorism Financing", "Sanctions Violations", "Bribery", "Environmental Crime",
  ],
  selectedMedia: ["Financial Crime", "Fraud", "Money Laundering", "Terrorism Financing"],
  confidence: [75],
  severity: [60]
};

const entityPolicyConfigs: Record<string, any> = {};
let policyAuditLogs: any[] = [
  { id: "1", entity: "Historical_SAR_Filings_2023.csv", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "System", action: "Initial policy configuration", configState: policyConfigData },
  { id: "2", entity: "Google", timestamp: new Date(Date.now() - 172800000).toISOString(), user: "Admin", action: "Updated thresholds", configState: policyConfigData }
];

mock.onGet(/\/policy\/config.*/).reply((config) => {
  const params = new URLSearchParams(config.url?.split("?")[1]);
  const entity = params.get("entity") || "default";
  return [200, entityPolicyConfigs[entity] || policyConfigData];
});

mock.onPost("/policy/config").reply((config) => {
  const { entity, config: newConfig } = JSON.parse(config.data);
  entityPolicyConfigs[entity] = newConfig;
  
  const log = {
    id: Date.now().toString(),
    entity,
    timestamp: new Date().toISOString(),
    user: "Admin",
    action: "Updated Policy Configuration",
    configState: newConfig
  };
  policyAuditLogs.unshift(log);
  
  return [200, { success: true }];
});

mock.onGet(/\/policy\/audit-logs.*/).reply((config) => {
  const params = new URLSearchParams(config.url?.split("?")[1]);
  const entity = params.get("entity");
  if (entity) {
    return [200, policyAuditLogs.filter(l => l.entity === entity)];
  }
  return [200, policyAuditLogs];
});

mock.onPost("/policy/rollback").reply((config) => {
  const { entity, logId } = JSON.parse(config.data);
  const log = policyAuditLogs.find(l => l.id === logId);
  if (log) {
    entityPolicyConfigs[entity] = log.configState;
    const newLog = {
      id: Date.now().toString(),
      entity,
      timestamp: new Date().toISOString(),
      user: "Admin",
      action: `Rolled back to version from ${new Date(log.timestamp).toLocaleTimeString()}`,
      configState: log.configState
    };
    policyAuditLogs.unshift(newLog);
  }
  return [200, { success: true }];
});

// --- PORTFOLIO ONBOARDING DATA ---
mock.onGet("/portfolio/sample-preview").reply(200, [
  { id: "ENT-AAPL", name: "Apple Inc", type: "Public", dob: "1976-04-01", country: "US", risk: "Low", onboarded: "Pending" },
  { id: "ENT-BMR", name: "B & M Retail Limited", type: "Public", dob: "1978-03-14", country: "Jersey", risk: "Medium", onboarded: "Pending" },
  { id: "ENT-BOY", name: "Bodycote PLC", type: "Public", dob: "1923-01-01", country: "UK", risk: "Low", onboarded: "Pending" },
  { id: "ENT-BP", name: "BP plc", type: "Public", dob: "1909-04-14", country: "UK", risk: "Critical", onboarded: "Pending" },
  { id: "ENT-CLDN", name: "Caledonia Investments plc", type: "Public", dob: "1928-01-01", country: "UK", risk: "Low", onboarded: "Pending" }
]);

// --- MASTER DATA INDEX ---
mock.onGet("/unified-records").reply(200, [
  { id: "ur_1", entity: "John Doe", contextSnippet: "Customer profile matched with internal banking records. Risk score updated.", sourceName: "Banking API", sourceType: "api", confidence: 99, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "ur_2", entity: "Acme Corp", contextSnippet: "Found in transaction logs associated with high-risk jurisdictions.", sourceName: "SAR_Filings.csv", sourceType: "csv", confidence: 85, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "ur_3", entity: "Jane Smith", contextSnippet: "Listed as beneficial owner in recent KYC documents.", sourceName: "KYC_Records.pdf", sourceType: "pdf", confidence: 92, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "ur_4", entity: "Global Tech LLC", contextSnippet: "Entity flagged on internal sanctions monitoring list.", sourceName: "Sanctions.xlsx", sourceType: "excel", confidence: 100, timestamp: new Date(Date.now() - 150000).toISOString() },
  { id: "ur_5", entity: "Acme Corp", contextSnippet: "Mentioned in quarterly board meeting minutes regarding compliance audit.", sourceName: "Board_Minutes.docx", sourceType: "doc", confidence: 78, timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: "ur_6", entity: "Frontier Ltd", contextSnippet: "Cross-referenced with external watchlist API feed.", sourceName: "Watchlist API", sourceType: "api", confidence: 95, timestamp: new Date(Date.now() - 50000).toISOString() }
]);


// --- CONSOLIDATED FROM sample-data.ts ---
export const sampleEntities = [
  { id: "ENT-001", name: "John Doe", type: "Individual", jurisdiction: "United Kingdom", riskScore: 87, latestSignal: "OFAC sanctions match", lastChecked: "2 min ago", status: "High Risk", owner: "Sarah Chen" },
  { id: "ENT-002", name: "Al Noor Trading LLC", type: "Company", jurisdiction: "UAE", riskScore: 92, latestSignal: "Adverse media - fraud", lastChecked: "5 min ago", status: "Critical", owner: "James Mitchell" },
  { id: "ENT-003", name: "Eastern Capital Partners", type: "Company", jurisdiction: "Singapore", riskScore: 64, latestSignal: "PEP association", lastChecked: "12 min ago", status: "Medium Risk", owner: "Sarah Chen" },
  { id: "ENT-004", name: "Maria Petrov", type: "Individual", jurisdiction: "Russia", riskScore: 78, latestSignal: "Sanctions list update", lastChecked: "8 min ago", status: "High Risk", owner: "David Park" },
  { id: "ENT-005", name: "Global Meridian Holdings", type: "Company", jurisdiction: "Cayman Islands", riskScore: 55, latestSignal: "Reputational risk", lastChecked: "15 min ago", status: "Medium Risk", owner: "James Mitchell" },
  { id: "ENT-006", name: "Chen Wei Industries", type: "Company", jurisdiction: "Hong Kong", riskScore: 34, latestSignal: "Routine check", lastChecked: "1 hr ago", status: "Low Risk", owner: "David Park" },
  { id: "ENT-007", name: "Nordic Shipping AS", type: "Company", jurisdiction: "Norway", riskScore: 21, latestSignal: "No new signals", lastChecked: "2 hr ago", status: "Low Risk", owner: "Sarah Chen" },
  { id: "ENT-008", name: "Banco del Sur SA", type: "Company", jurisdiction: "Argentina", riskScore: 71, latestSignal: "Corruption allegation", lastChecked: "20 min ago", status: "High Risk", owner: "James Mitchell" },
  { id: "ENT-009", name: "Quantum Innovations", type: "Company", jurisdiction: "Switzerland", riskScore: 28, latestSignal: "UBO change", lastChecked: "3 hr ago", status: "Low Risk", owner: "Sarah Chen" },
  { id: "ENT-010", name: "Vladimir Sokolov", type: "Individual", jurisdiction: "Cyprus", riskScore: 94, latestSignal: "Sanctions evasion risk", lastChecked: "1 min ago", status: "Critical", owner: "James Mitchell" },
  { id: "ENT-011", name: "Desert Sands Construction", type: "Company", jurisdiction: "Qatar", riskScore: 61, latestSignal: "Adverse media - labor", lastChecked: "45 min ago", status: "Medium Risk", owner: "David Park" },
  { id: "ENT-012", name: "Helena Rostova", type: "Individual", jurisdiction: "United Kingdom", riskScore: 82, latestSignal: "PEP list update", lastChecked: "5 min ago", status: "High Risk", owner: "Sarah Chen" },
  { id: "ENT-013", name: "Alpha Trading Group", type: "Company", jurisdiction: "British Virgin Islands", riskScore: 75, latestSignal: "Shell company indicator", lastChecked: "18 min ago", status: "High Risk", owner: "David Park" },
];

export const sampleAlerts = [
  { id: "ALT-4891", title: "New adverse media hit for John Doe", subtitle: "Suspected fraud exposure identified in Financial Times article", severity: "critical" as const, entity: "John Doe", source: "Adverse Media", time: "2 min ago", confidence: 94 },
  { id: "ALT-4890", title: "Entity matched to updated OFAC sanctions record", subtitle: "Al Noor Trading LLC matched to SDN List revision 2024-03-15", severity: "critical" as const, entity: "Al Noor Trading LLC", source: "OFAC SDN", time: "8 min ago", confidence: 98 },
  { id: "ALT-4889", title: "Reputational risk spike detected", subtitle: "Negative sentiment surge in Middle East news sources", severity: "high" as const, entity: "Eastern Capital Partners", source: "Global Media", time: "15 min ago", confidence: 82 },
  { id: "ALT-4888", title: "New PEP association identified", subtitle: "Director linked to politically exposed person in Russia", severity: "high" as const, entity: "Maria Petrov", source: "PEP Database", time: "22 min ago", confidence: 88 },
  { id: "ALT-4887", title: "Sanctions list update - potential match", subtitle: "Entity name fuzzy match on EU consolidated sanctions list", severity: "medium" as const, entity: "Global Meridian Holdings", source: "EU Sanctions", time: "35 min ago", confidence: 71 },
  { id: "ALT-4886", title: "Corruption allegation in media", subtitle: "Local news report linking entity to government contract irregularities", severity: "medium" as const, entity: "Banco del Sur SA", source: "Adverse Media", time: "1 hr ago", confidence: 67 },
  { id: "ALT-4885", title: "Suspected sanctions evasion network", subtitle: "Vladimir Sokolov linked to shell company network in Cyprus", severity: "critical" as const, entity: "Vladimir Sokolov", source: "Network Analysis", time: "1 min ago", confidence: 91 },
  { id: "ALT-4884", title: "New high-ranking PEP match", subtitle: "Helena Rostova identified as close associate of sanctioned individual", severity: "high" as const, entity: "Helena Rostova", source: "PEP Database", time: "5 min ago", confidence: 86 },
  { id: "ALT-4883", title: "Shell company risk indicator", subtitle: "Alpha Trading Group matches known typology for illicit fund flows", severity: "high" as const, entity: "Alpha Trading Group", source: "Behavioral AI", time: "18 min ago", confidence: 79 },
  { id: "ALT-4882", title: "Adverse media hit - Labor practices", subtitle: "Desert Sands Construction mentioned in NGO report on labor conditions", severity: "medium" as const, entity: "Desert Sands Construction", source: "Adverse Media", time: "45 min ago", confidence: 62 },
];

export const agentActivities = [
  { agent: "Sanctions Agent", action: "Crawling OFAC SDN list updates", status: "active" as const, time: "now" },
  { agent: "Sanctions Agent", action: "Processing EU consolidated list revision", status: "completed" as const, time: "1 min ago" },
  { agent: "Media Agent", action: "Scanning 2,847 global news sources", status: "active" as const, time: "now" },
  { agent: "Entity Resolution Agent", action: "Resolving fuzzy match: Al Noor Trading ↔ Al-Noor Trade Co", status: "active" as const, time: "now" },
  { agent: "Risk Scoring Agent", action: "Recalculating risk score for ENT-002", status: "completed" as const, time: "2 min ago" },
  { agent: "Media Agent", action: "Extracting named entities from Financial Times article", status: "completed" as const, time: "3 min ago" },
  { agent: "Policy Agent", action: "Checking threshold breach for high-risk jurisdictions", status: "completed" as const, time: "4 min ago" },
  { agent: "Alerting Agent", action: "Generating case summary for ALT-4891", status: "active" as const, time: "now" },
  { agent: "Sanctions Agent", action: "Checking UN Security Council sanctions", status: "completed" as const, time: "5 min ago" },
  { agent: "Risk Scoring Agent", action: "Scoring event: corruption allegation", status: "completed" as const, time: "6 min ago" },
];


// --- CONSOLIDATED FROM media-sample-data.ts ---
export const mediaArticles = [
  {
    id: "ART-001",
    headline: "Al Noor Trading linked to corruption probe in UAE",
    source: "Financial Times",
    sourceCountry: "UK",
    timestamp: "2 min ago",
    language: "English",
    credibilityScore: 96,
    entities: ["Al Noor Trading LLC", "Ahmed Hassan"],
    riskTags: ["corruption", "regulatory investigation"],
    severity: "critical" as const,
    summary: "Article indicates potential involvement of Al Noor Trading LLC in a corruption investigation led by UAE financial regulators. Multiple government officials cited.",
    content: `Dubai-based Al Noor Trading LLC is under investigation by the UAE Securities and Commodities Authority for alleged involvement in a corruption scheme linked to government procurement contracts worth over $120 million. Sources close to the investigation confirmed that the company's CEO, Ahmed Hassan, has been questioned by authorities regarding irregular financial flows detected between 2022 and 2024. The investigation was triggered by suspicious transaction reports filed by three major UAE banks.`,
    matchedEntity: "Al Noor Trading LLC",
    matchConfidence: 98,
    riskScore: 92,
  },
  {
    id: "ART-002",
    headline: "John Doe named in SEC fraud investigation documents",
    source: "Reuters",
    sourceCountry: "US",
    timestamp: "8 min ago",
    language: "English",
    credibilityScore: 98,
    entities: ["John Doe", "Meridian Capital"],
    riskTags: ["fraud", "securities violation"],
    severity: "critical" as const,
    summary: "SEC enforcement documents reference John Doe in connection with alleged securities fraud involving Meridian Capital's investment fund.",
    content: `The U.S. Securities and Exchange Commission has released enforcement documents naming John Doe as a person of interest in an ongoing investigation into Meridian Capital's flagship investment fund. The documents allege a pattern of fraudulent misrepresentation of fund performance metrics between 2021 and 2023, potentially affecting institutional investors across multiple jurisdictions.`,
    matchedEntity: "John Doe",
    matchConfidence: 94,
    riskScore: 87,
  },
  {
    id: "ART-003",
    headline: "Eastern Capital Partners director linked to sanctioned Russian oligarch",
    source: "The Guardian",
    sourceCountry: "UK",
    timestamp: "15 min ago",
    language: "English",
    credibilityScore: 92,
    entities: ["Eastern Capital Partners", "Viktor Volkov", "Maria Petrov"],
    riskTags: ["sanctions exposure", "PEP association"],
    severity: "high" as const,
    summary: "Investigation reveals business connections between Eastern Capital Partners' board and individuals on EU/UK sanctions lists.",
    content: `An investigation by The Guardian has uncovered previously undisclosed business links between a director of Singapore-based Eastern Capital Partners and Viktor Volkov, a Russian oligarch sanctioned by both the EU and UK. Documents reviewed by the newspaper show that Maria Petrov, who serves on the firm's advisory board, held joint ventures with Volkov through a network of shell companies in Cyprus.`,
    matchedEntity: "Eastern Capital Partners",
    matchConfidence: 88,
    riskScore: 64,
  },
  {
    id: "ART-004",
    headline: "Banco del Sur SA faces money laundering allegations in Argentina",
    source: "Bloomberg",
    sourceCountry: "US",
    timestamp: "22 min ago",
    language: "English",
    credibilityScore: 97,
    entities: ["Banco del Sur SA", "Carlos Mendez"],
    riskTags: ["money laundering", "regulatory action"],
    severity: "high" as const,
    summary: "Argentine financial regulator announces formal investigation into Banco del Sur SA for suspected money laundering activities.",
    content: `Argentina's financial intelligence unit (UIF) has opened a formal investigation into Banco del Sur SA following the detection of suspicious transaction patterns totalling approximately $45 million over 18 months. The bank's compliance officer, Carlos Mendez, has been suspended pending the outcome of the investigation.`,
    matchedEntity: "Banco del Sur SA",
    matchConfidence: 96,
    riskScore: 71,
  },
  {
    id: "ART-005",
    headline: "Global Meridian Holdings under scrutiny for tax evasion scheme",
    source: "Wall Street Journal",
    sourceCountry: "US",
    timestamp: "35 min ago",
    language: "English",
    credibilityScore: 95,
    entities: ["Global Meridian Holdings", "Cayman Islands Reg. Auth."],
    riskTags: ["tax evasion", "regulatory investigation"],
    severity: "medium" as const,
    summary: "Cayman Islands regulatory authority investigating Global Meridian Holdings for alleged complex tax avoidance structures.",
    content: `The Cayman Islands Monetary Authority (CIMA) has launched an inquiry into Global Meridian Holdings following revelations about a complex web of subsidiary entities allegedly designed to facilitate tax evasion for high-net-worth clients. The structures reportedly involve entities across five jurisdictions.`,
    matchedEntity: "Global Meridian Holdings",
    matchConfidence: 91,
    riskScore: 55,
  },
  {
    id: "ART-006",
    headline: "Chen Wei Industries flagged in Hong Kong KYB review",
    source: "South China Morning Post",
    sourceCountry: "Hong Kong",
    timestamp: "1 hr ago",
    language: "English",
    credibilityScore: 88,
    entities: ["Chen Wei Industries"],
    riskTags: ["KYB compliance", "regulatory review"],
    severity: "low" as const,
    summary: "Routine KYB compliance review by Hong Kong regulators includes Chen Wei Industries among entities under enhanced monitoring.",
    content: `Hong Kong's Securities and Futures Commission has included Chen Wei Industries in its latest round of enhanced KYB compliance reviews. The review is described as routine and part of the regulator's broader initiative to strengthen Know Your Business oversight across the territory.`,
    matchedEntity: "Chen Wei Industries",
    matchConfidence: 85,
    riskScore: 34,
  },
];

export const mediaSources = [
  { name: "Financial Times", country: "United Kingdom", type: "News", credibility: 96, articlesPerDay: 847, lastUpdated: "1 min ago", reliability: "high" as const },
  { name: "Reuters", country: "United States", type: "Wire Service", credibility: 98, articlesPerDay: 2340, lastUpdated: "now", reliability: "high" as const },
  { name: "Bloomberg", country: "United States", type: "Financial News", credibility: 97, articlesPerDay: 1520, lastUpdated: "now", reliability: "high" as const },
  { name: "The Guardian", country: "United Kingdom", type: "News", credibility: 92, articlesPerDay: 620, lastUpdated: "2 min ago", reliability: "high" as const },
  { name: "Wall Street Journal", country: "United States", type: "Financial News", credibility: 95, articlesPerDay: 890, lastUpdated: "1 min ago", reliability: "high" as const },
  { name: "South China Morning Post", country: "Hong Kong", type: "News", credibility: 88, articlesPerDay: 410, lastUpdated: "3 min ago", reliability: "medium" as const },
  { name: "Al Jazeera", country: "Qatar", type: "News", credibility: 84, articlesPerDay: 520, lastUpdated: "5 min ago", reliability: "medium" as const },
  { name: "OFAC SDN Updates", country: "United States", type: "Regulatory", credibility: 100, articlesPerDay: 12, lastUpdated: "15 min ago", reliability: "high" as const },
  { name: "EU Official Journal", country: "Belgium", type: "Regulatory", credibility: 100, articlesPerDay: 8, lastUpdated: "1 hr ago", reliability: "high" as const },
  { name: "Nikkei Asia", country: "Japan", type: "Financial News", credibility: 90, articlesPerDay: 380, lastUpdated: "4 min ago", reliability: "high" as const },
  { name: "Handelsblatt", country: "Germany", type: "Financial News", credibility: 91, articlesPerDay: 290, lastUpdated: "6 min ago", reliability: "high" as const },
  { name: "Compliance Monitor", country: "United Kingdom", type: "Industry", credibility: 87, articlesPerDay: 45, lastUpdated: "20 min ago", reliability: "medium" as const },
];

export const mediaAgentActivities = [
  { action: "Crawling Financial Times for new articles", status: "active" as const, time: "now", detail: "Scanning 12 new articles" },
  { action: "Extracting entities from Reuters article #RT-48291", status: "active" as const, time: "now", detail: "NLP pipeline running" },
  { action: "Matching 'Ahmed Hassan' against portfolio", status: "active" as const, time: "now", detail: "Fuzzy match: 94% confidence" },
  { action: "Scoring risk event: corruption allegation", status: "completed" as const, time: "1 min ago", detail: "Score: HIGH (92)" },
  { action: "Generated alert ALT-4891 for Al Noor Trading", status: "completed" as const, time: "2 min ago", detail: "Confidence: 98%" },
  { action: "Crawling Bloomberg terminal feeds", status: "completed" as const, time: "3 min ago", detail: "847 articles scanned" },
  { action: "Entity resolution: John Doe ↔ J. Doe disambiguation", status: "completed" as const, time: "4 min ago", detail: "Resolved with 91% confidence" },
  { action: "Processing Arabic-language Al Jazeera article", status: "completed" as const, time: "5 min ago", detail: "Translation + extraction" },
  { action: "Updating source credibility scores", status: "completed" as const, time: "6 min ago", detail: "12 sources recalibrated" },
  { action: "Batch alert digest compiled", status: "completed" as const, time: "8 min ago", detail: "14 alerts in digest" },
];

export const riskCategories = [
  { category: "Fraud", count: 47, trend: "+12%", color: "hsl(0 72% 51%)" },
  { category: "Money Laundering", count: 34, trend: "+8%", color: "hsl(38 92% 50%)" },
  { category: "Corruption", count: 28, trend: "+15%", color: "hsl(263 70% 58%)" },
  { category: "Sanctions Exposure", count: 22, trend: "-3%", color: "hsl(221 83% 53%)" },
  { category: "PEP Association", count: 18, trend: "+5%", color: "hsl(142 71% 45%)" },
  { category: "Tax Evasion", count: 11, trend: "+2%", color: "hsl(220 10% 46%)" },
];

export const mediaSignalsOverTime = [
  { date: "Mon", signals: 42, alerts: 8, highRisk: 3 },
  { date: "Tue", signals: 58, alerts: 12, highRisk: 5 },
  { date: "Wed", signals: 51, alerts: 9, highRisk: 4 },
  { date: "Thu", signals: 67, alerts: 15, highRisk: 7 },
  { date: "Fri", signals: 73, alerts: 18, highRisk: 8 },
  { date: "Sat", signals: 38, alerts: 6, highRisk: 2 },
  { date: "Sun", signals: 45, alerts: 7, highRisk: 3 },
];

export const entityMediaTimeline = [
  { date: "2024-01-15", event: "First mention in regulatory filing", source: "SEC EDGAR", severity: "low" as const },
  { date: "2024-02-22", event: "Named in investigative report", source: "Financial Times", severity: "medium" as const },
  { date: "2024-03-08", event: "Fraud allegations surface", source: "Reuters", severity: "high" as const },
  { date: "2024-03-12", event: "Company issues denial statement", source: "PR Newswire", severity: "low" as const },
  { date: "2024-03-18", event: "SEC confirms investigation", source: "Bloomberg", severity: "critical" as const },
  { date: "2024-03-25", event: "Related entity sanctioned", source: "OFAC SDN", severity: "critical" as const },
];

export const pipelineStages = [
  {
    name: "Raw Article",
    status: "completed" as const,
    input: "HTML page from Financial Times",
    output: "Cleaned article text (2,847 words)",
    confidence: 100,
    processingTime: "0.3s",
    model: "HTML Parser v3.2",
  },
  {
    name: "NLP Extraction",
    status: "completed" as const,
    input: "Cleaned article text",
    output: "14 named entities, 6 risk keywords, 3 locations",
    confidence: 94,
    processingTime: "1.2s",
    model: "SpaCy NER + Custom Financial Model v2.1",
  },
  {
    name: "Entity Detection",
    status: "completed" as const,
    input: "14 named entities",
    output: "3 persons, 2 organisations, 1 government body",
    confidence: 91,
    processingTime: "0.8s",
    model: "Entity Classification Model v1.8",
  },
  {
    name: "Risk Detection",
    status: "completed" as const,
    input: "Article context + entities",
    output: "fraud (0.92), corruption (0.87), sanctions exposure (0.34)",
    confidence: 89,
    processingTime: "0.6s",
    model: "Risk Signal Classifier v3.0",
  },
  {
    name: "Portfolio Matching",
    status: "completed" as const,
    input: "3 persons, 2 organisations",
    output: "2 matches found (John Doe: 94%, Al Noor Trading: 98%)",
    confidence: 96,
    processingTime: "0.4s",
    model: "Fuzzy Match Engine v2.5",
  },
  {
    name: "Risk Scoring",
    status: "completed" as const,
    input: "Matched entities + risk signals",
    output: "Risk score: 92 (HIGH)",
    confidence: 91,
    processingTime: "0.2s",
    model: "Risk Scoring Model v4.1",
  },
  {
    name: "Alert Generation",
    status: "active" as const,
    input: "High-risk scored event",
    output: "Alert ALT-4891 created, case summary generated",
    confidence: 98,
    processingTime: "0.5s",
    model: "Alert Engine v2.3",
  },
];

