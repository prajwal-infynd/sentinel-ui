import MockAdapter from "axios-mock-adapter";
import { apiClient } from "./api-client";
import { formatRelativeTime } from "./utils";

// Initialize mock adapter
export const mock = new MockAdapter(apiClient, { delayResponse: 500 }); // simulate network delay

// --- DASHBOARD DATA ---
mock.onGet("/dashboard/summary").reply(200, {
  organizationName: "Monitoring Workspace",
  entityCount: 154,
  alertCount: 42,
  highRiskAlertCount: 12,
  articleCount: 12450,
  openCaseCount: 8,
  avgRiskScore: 68.4,
  activeAgentRuns: 3,
});

const mockEntities = [
  { id: "1", name: "Acme Corp", entity_type: "company", jurisdiction: "US", risk_score: 85, latest_signal: "Adverse Media Mention", last_screened_at: new Date().toISOString(), status: "Active" },
  { id: "2", name: "Global Tech", entity_type: "company", jurisdiction: "UK", risk_score: 42, latest_signal: "PEP Match", last_screened_at: new Date().toISOString(), status: "Active" },
  { id: "3", name: "John Doe", entity_type: "individual", jurisdiction: "EU", risk_score: 92, latest_signal: "Sanctions List", last_screened_at: new Date().toISOString(), status: "Active" },
  { id: "4", name: "Helena Rostova", entity_type: "individual", jurisdiction: "UK", risk_score: 82, latest_signal: "PEP Record Updated", last_screened_at: new Date().toISOString(), status: "Active" },
  { id: "5", name: "Desert Sands Construction", entity_type: "company", jurisdiction: "QA", risk_score: 61, latest_signal: "Adverse Media", last_screened_at: new Date().toISOString(), status: "Active" },
  { id: "7", name: "Novosibirsk Logistics Ltd", entity_type: "company", jurisdiction: "RU", risk_score: 98, latest_signal: "State-Sponsored Cyber Activity", last_screened_at: new Date().toISOString(), status: "Critical" },
  { id: "8", name: "Sinaloa Agribusiness Corp", entity_type: "company", jurisdiction: "MX", risk_score: 96, latest_signal: "Cartel Front Company", last_screened_at: new Date().toISOString(), status: "Critical" },
  { id: "9", name: "Dr. Chen Wei", entity_type: "individual", jurisdiction: "HK", risk_score: 88, latest_signal: "IP Theft Allegation", last_screened_at: new Date().toISOString(), status: "Active" },
  { id: "10", name: "Panama Trust Services", entity_type: "company", jurisdiction: "PA", risk_score: 85, latest_signal: "Panama Papers Associated", last_screened_at: new Date().toISOString(), status: "Active" },
];

mock.onGet("/portfolio/entities").reply(() => [200, mockEntities]);

mock.onPatch(/\/portfolio\/entities\/.+\/status/).reply((config) => {
  const match = config.url?.match(/\/portfolio\/entities\/(.+)\/status/);
  if (match) {
    const id = match[1];
    const { status } = JSON.parse(config.data);
    const entityIndex = mockEntities.findIndex(e => e.id === id);
    if (entityIndex !== -1) {
      mockEntities[entityIndex] = { ...mockEntities[entityIndex], status };
      return [200, mockEntities[entityIndex]];
    }
  }
  return [404, { message: "Entity not found" }];
});

mock.onGet("/alerts").reply(200, [
  { id: "a1", title: "Sanctions Match", summary: "Entity matched with OFAC sanctions list.", severity: "critical", generated_at: new Date().toISOString(), confidence_score: 95, status: "open", monitored_entities: { name: "John Doe" }, media_articles: { headline: "John Doe added to sanctions list" } },
  { id: "a2", title: "Adverse Media", summary: "Negative news regarding fraud allegations.", severity: "high", generated_at: new Date(Date.now() - 3600000).toISOString(), confidence_score: 88, status: "investigating", monitored_entities: { name: "Acme Corp" }, media_articles: { headline: "Acme Corp under investigation for fraud" } },
  { id: "a3", title: "Suspected sanctions evasion network", summary: "Vladimir Sokolov linked to shell company network in Cyprus", severity: "critical", generated_at: new Date(Date.now() - 60000).toISOString(), confidence_score: 91, status: "open", monitored_entities: { name: "Vladimir Sokolov" }, media_articles: { headline: "Cyprus shell companies tied to sanctioned individuals" } },
  { id: "a5", title: "State-Sponsored Cyber Activity Detected", summary: "Entity identified as a front for Russian intelligence cyber operations targeting financial infrastructure.", severity: "critical", generated_at: new Date(Date.now() - 45000).toISOString(), confidence_score: 98, status: "open", monitored_entities: { name: "Novosibirsk Logistics Ltd" }, media_articles: { headline: "Treasury sanctions cyber warfare fronts" } },
  { id: "a6", title: "Cartel Front Company Allegations", summary: "Mexican agribusiness flagged for laundering illicit narcotics proceeds through shell networks.", severity: "critical", generated_at: new Date(Date.now() - 120000).toISOString(), confidence_score: 96, status: "investigating", monitored_entities: { name: "Sinaloa Agribusiness Corp" }, media_articles: { headline: "DOJ indicts massive cartel laundering ring" } },
  { id: "a7", title: "Corporate Espionage / IP Theft", summary: "High-ranking executive accused of transferring proprietary trading algorithms to foreign state.", severity: "high", generated_at: new Date(Date.now() - 86400000).toISOString(), confidence_score: 88, status: "open", monitored_entities: { name: "Dr. Chen Wei" }, media_articles: { headline: "Tech giant executive charged with espionage" } },
  { id: "a8", title: "Offshore Tax Evasion Leak", summary: "Entity appeared in recent leak of offshore trust structures facilitating widespread tax evasion.", severity: "medium", generated_at: new Date(Date.now() - 172800000).toISOString(), confidence_score: 85, status: "resolved", monitored_entities: { name: "Panama Trust Services" }, media_articles: { headline: "New offshore leak exposes corporate tax havens" } },
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

mock.onPost("/portfolio/import").reply(200, { imported: 3 });

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
  { id: "CUST-00142", name: "John Doe", type: "Individual", dob: "1985-03-22", country: "United Kingdom", regNo: "—", risk: "High", onboarded: "2023-01-15" },
  { id: "CUST-00389", name: "Al Noor Trading LLC", type: "Company", dob: "2011-06-10", country: "UAE", regNo: "DXB-2011-4827", risk: "Critical", onboarded: "2022-09-01" },
  { id: "CUST-01204", name: "Maria Petrov", type: "Individual", dob: "1978-11-30", country: "Russia", regNo: "—", risk: "Medium", onboarded: "2023-06-20" },
  { id: "CUST-00671", name: "Eastern Capital Partners", type: "Company", dob: "2015-02-14", country: "Singapore", regNo: "SG-201504821K", risk: "Medium", onboarded: "2023-03-10" },
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
