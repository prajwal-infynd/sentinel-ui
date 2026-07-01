import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import DemoEntry from "./pages/DemoEntry";
import PortfolioOnboarding from "./pages/PortfolioOnboarding";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LiveAlerts from "./pages/LiveAlerts";
import Investigation from "./pages/Investigation";
import InvestigationsList from "./pages/InvestigationsList";
import AIAgents from "./pages/AIAgents";
import ExternalData from "./pages/data/ExternalData";
import CustomData from "./pages/data/CustomData";
import InfyndData from "./pages/data/InfyndData";
import CrawlingData from "./pages/data/CrawlingData";
import PolicyConfig from "./pages/PolicyConfig";
import AIGovernance from "./pages/AIGovernance";
import Reporting from "./pages/Reporting";
import DemoClosing from "./pages/DemoClosing";
import NotFound from "./pages/NotFound";
import { MonitorLayout } from "@/components/MonitorLayout";
import MonitorNewsFeed from "./pages/monitor/MonitorNewsFeed";
import MonitorWatchlists from "./pages/monitor/MonitorWatchlists";
import MonitorRiskAnalytics from "./pages/monitor/MonitorRiskAnalytics";
import MonitorReports from "./pages/monitor/MonitorReports";
import MediaDashboard from "./pages/media/MediaDashboard";
import MediaSources from "./pages/media/MediaSources";
import MediaPipeline from "./pages/media/MediaPipeline";
import MediaArticleDetail from "./pages/media/MediaArticleDetail";
import MediaEntityView from "./pages/media/MediaEntityView";
import MediaSignals from "./pages/media/MediaSignals";
import MediaConfig from "./pages/media/MediaConfig";
import MediaAlerts from "./pages/media/MediaAlerts";
import MediaWorkspace from "./pages/media/MediaWorkspace";
import MediaExplainability from "./pages/media/MediaExplainability";
import MediaAutomation from "./pages/media/MediaAutomation";
import LiveCrawlEngine from "./pages/LiveCrawlEngine";
import Settings from "./pages/Settings";
import AdminPortal from "./pages/AdminPortal";
import Landing from "./pages/Landing";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { InvestigationsProvider } from "@/context/InvestigationsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <InvestigationsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Landing />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/demo" element={<DemoEntry />} />
              <Route path="/monitor" element={<MonitorLayout />}>
                <Route index element={<Navigate to="/monitor/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="news-feed" element={<MonitorNewsFeed />} />
                <Route path="investigations" element={<InvestigationsList />} />
                <Route path="companies" element={<PortfolioOnboarding key="force-reset-2" />} />
                <Route path="watchlists" element={<MonitorWatchlists />} />
                <Route path="risk-analytics" element={<MonitorRiskAnalytics />} />
                <Route path="reports" element={<MonitorReports />} />
              </Route>
              
              <Route path="/ai-agent" element={<AIAgents />} />
              
              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/monitor/dashboard" replace />} />
              <Route path="/portfolio" element={<Navigate to="/monitor/companies" replace />} />
              <Route path="/alerts" element={<Navigate to="/monitor/alerts" replace />} />
              <Route path="/investigations" element={<Navigate to="/monitor/investigations" replace />} />
              <Route path="/agents" element={<Navigate to="/ai-agent" replace />} />

              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/investigations/:id" element={<Investigation />} />
              
              <Route path="/architecture" element={<Navigate to="/architecture/external" replace />} />
              <Route path="/architecture/external" element={<ExternalData />} />
              <Route path="/architecture/custom" element={<CustomData />} />
              <Route path="/architecture/infynd" element={<InfyndData />} />
              <Route path="/architecture/crawling" element={<CrawlingData />} />
              <Route path="/policy" element={<PolicyConfig />} />
              <Route path="/governance" element={<AIGovernance />} />
              <Route path="/reporting" element={<Reporting />} />
              <Route path="/closing" element={<DemoClosing />} />
              <Route path="/media" element={<MediaDashboard />} />
              <Route path="/media/sources" element={<MediaSources />} />
              <Route path="/media/pipeline" element={<MediaPipeline />} />
              <Route path="/media/article/:id" element={<MediaArticleDetail />} />
              <Route path="/media/entity" element={<MediaEntityView />} />
              <Route path="/media/signals" element={<MediaSignals />} />
              <Route path="/media/config" element={<MediaConfig />} />
              <Route path="/media/alerts" element={<MediaAlerts />} />
              <Route path="/media/workspace" element={<MediaWorkspace />} />
              <Route path="/media/explainability" element={<MediaExplainability />} />
              <Route path="/media/automation" element={<MediaAutomation />} />
              <Route path="/crawl" element={<LiveCrawlEngine />} />
            </Route>

            <Route element={<ProtectedRoute requirePermission="manage_subscription" />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route element={<ProtectedRoute requirePermission="invite_user" />}>
              <Route path="/admin" element={<AdminPortal />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </InvestigationsProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
