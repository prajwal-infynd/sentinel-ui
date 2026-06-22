

# Agentic KYC/AML Monitoring Platform — Build Plan

## Overview
A multi-page enterprise demo platform for continuous AML & KYC monitoring, designed for bank compliance teams. Premium, data-dense, audit-friendly UI with Palantir/Bloomberg-inspired aesthetics.

## Design System
- **Colors**: Deep Navy (#0B1220), AI Blue (#2563EB), Electric Purple (#7C3AED) for agent actions, plus risk severity colors (red/amber/green)
- **Typography**: Geist Sans + Geist Mono for data. Tight tracking, tabular numbers
- **Cards**: rounded-xl, layered shadows (no borders), glass-and-steel aesthetic
- **Depth**: Soft shadow stacks instead of solid borders
- **Motion**: 200ms transitions with Linear easing, spring animations for alerts

## Navigation
- **Sidebar**: Collapsible enterprise sidebar with sections: Overview, Portfolio, Live Alerts, Investigations, AI Agents, Data Architecture, Policy Layer, Reporting, Settings
- **Global Header**: Search bar, notification bell, environment badge (Demo/Live), analyst avatar, monitoring status indicator

## Pages

### 1. Landing / Hero
- Bold headline: "Continuous AML & KYC Monitoring, Powered by AI Agents"
- Animated node-graph visualization: Sources → Agents → Matching → Scoring → Alerts → Review (framer-motion pulse animations)
- 4 stat cards with large mono numbers (50M+ signals, 10K+ sources, <15 min detection, 70% review reduction)
- CTAs: "Book Demo" + "Launch Platform Demo"

### 2. Demo Entry Page
- 5 large cards as guided entry points: Upload Portfolio, Live Monitoring, Alert Investigations, Data Architecture, AI Agent Workflows
- Clean "control room" feel

### 3. Customer Portfolio Onboarding
- Drag-and-drop upload zone + CSV/Excel/API connector cards
- Preview table with sample fields (customer ID, entity name, type, DOB, country, etc.)
- Right-side explainer panel showing the onboarding pipeline
- "Start Monitoring" CTA

### 4. Portfolio Monitoring Dashboard (Hero Screen)
- Header with portfolio name, entity count, refresh time, live status
- 8 KPI cards in a responsive grid
- Charts: alerts over time, by severity, by category, jurisdiction heatmap, source mix breakdown
- Large filterable data table with entity rows showing risk score micro-bars, signal badges, status dots
- Hover cards with AI quick-peek summaries
- Advanced filters panel

### 5. Live Alert Stream
- Split view: 40% alert feed (cards with severity border-left), 60% agent activity terminal
- Real-time styled agent log with timestamps and purple glow for "thinking" state
- Sample alerts with realistic compliance scenarios

### 6. Alert Investigation / Case Review
- Rich case header: alert title, severity, entity, confidence score, source, timestamp, assign button
- 6 tabs: Summary, Source Evidence, Entity Profile, Timeline, AI Reasoning, Audit Trail
- AI-generated summary with matched fields and suggested actions
- Side-by-side evidence viewer
- Entity profile with aliases, identifiers, linked jurisdictions, watchlist memberships
- Structured AI reasoning chain (not sparkles)
- Full audit trail with model versions and timestamps

### 7. AI Agent Workflow
- 6 agent cards: Sanctions, Media, Resolution, Scoring, Policy, Alerting — each showing status, tasks, signals, confidence
- Visual orchestration flow diagram showing the pipeline
- Subtle progress animations

### 8. Sanctions Data Architecture
- Visual pipeline: Raw Sources → S3 → Parsing → Standardisation → Delta Engine → MDM → Policy → Export
- Feature cards for each capability (delta updates, source lineage, auditability, etc.)
- Sample schema table with fields like master_entity_id, primary_name, aliases, sanctions_status, etc.

### 9. Policy Configuration
- Toggle switches for watchlists (EU, OFAC, UN, local law enforcement)
- Geography and regulator selectors
- Confidence threshold sliders
- Alert severity threshold controls
- Adverse media category selector

### 10. Executive Reporting
- Board-level KPIs: portfolio size, alerts by BU, false positive reduction, time saved, SLA compliance
- Charts suited for executive presentation
- Export buttons: PDF, board pack, weekly digest

### 11. Demo Closing / CTA
- Headline: "From static screening to continuous AI-driven risk intelligence"
- Expansion narrative copy
- 4 CTAs: Request Pilot, Speak to Product Team, Download Architecture, Start PoC

## Sample Data
Realistic entities (John Doe, Al Noor Trading LLC, Eastern Capital Partners, Maria Petrov, Global Meridian Holdings) with corresponding risk events throughout all screens.

## Key Interactions
- Skeleton loading states matching table structure
- Alert slide-in animations with spring physics
- Hover translate + shadow elevation on buttons
- Right-side drawer sheets for detail views (no full-screen modals)
- Expandable table rows
- Real-time refresh indicators

