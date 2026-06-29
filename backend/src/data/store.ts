// --- AUTH & USERS DATA ---
export const ROLES = {
  1: { id: 1, name: "Super Admin", basePermissions: ["admin:*"] },
  2: { id: 2, name: "Owner", basePermissions: ["invite_user", "manage_subscription", "crud:*"] },
  3: { id: 3, name: "User", basePermissions: ["crud:*"] },
  4: { id: 4, name: "Trial User", basePermissions: ["manage_subscription", "crud:*"] },
};

export let users = [
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














// --- DASHBOARD DATA ---
export let dashboardSummary = {
  organizationName: "Monitoring Workspace",
  entityCount: 5,
  alertCount: 0,
  highRiskAlertCount: 0,
  articleCount: 0,
  openCaseCount: 0,
  avgRiskScore: 0,
  activeAgentRuns: 0,
};



import fs from "fs";
import path from "path";

let infyndData: any = { data: [] };
try {
  const jsonPath = path.join(__dirname, "infynd-complete.json");
  infyndData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch (e) {
  console.error("Failed to load infynd-complete.json", e);
}

export let mockEntities: any[] = (infyndData.data || []).map((e: any) => ({
  id: "ENT-" + (e.normalizedDomain || Math.random().toString(36).substr(2, 5)).toUpperCase().replace(/[^A-Z0-9]/g, ''),
  name: e.nameFromTitle || e.clearbitName || e.normalizedDomain,
  entity_type: "company",
  jurisdiction: e.ipCountry || "Unknown",
  risk_score: Math.floor(Math.random() * 100),
  latest_signal: "Loaded from Infynd API",
  last_screened_at: new Date().toISOString(),
  status: "Active",
  payload: e,
}));















// Cleaned up stray code
// --- MEDIA AGENT DATA ---



















// --- REPORTING DATA ---


// --- DATA ARCHITECTURE DATA ---


// --- POLICY CONFIG DATA ---
export let policyConfigData = {
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

export const policyConfigs: Record<string, any> = {};
export let globalAuditLogs: any[] = [
  { id: "1", entity: "Historical_SAR_Filings_2023.csv", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "System", action: "Initial policy configuration", configState: policyConfigData },
  { id: "2", entity: "Google", timestamp: new Date(Date.now() - 172800000).toISOString(), user: "Admin", action: "Updated thresholds", configState: policyConfigData }
];









// --- PORTFOLIO ONBOARDING DATA ---


// --- MASTER DATA INDEX ---



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

