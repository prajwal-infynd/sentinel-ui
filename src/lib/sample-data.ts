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
