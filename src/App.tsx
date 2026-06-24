import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import DemoEntry from "./pages/DemoEntry";
import PortfolioOnboarding from "./pages/PortfolioOnboarding";
import Dashboard from "./pages/Dashboard";
import LiveAlerts from "./pages/LiveAlerts";
import Investigation from "./pages/Investigation";
import InvestigationsList from "./pages/InvestigationsList";
import AIAgents from "./pages/AIAgents";
import DataArchitecture from "./pages/DataArchitecture";
import PolicyConfig from "./pages/PolicyConfig";
import Reporting from "./pages/Reporting";
import DemoClosing from "./pages/DemoClosing";
import NotFound from "./pages/NotFound";
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
import Settings from "./pages/Settings";
import AdminPortal from "./pages/AdminPortal";
import { InvestigationsProvider } from "./context/InvestigationsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InvestigationsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/demo" element={<DemoEntry />} />
          <Route path="/portfolio" element={<PortfolioOnboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<LiveAlerts />} />
          <Route path="/investigations" element={<InvestigationsList />} />
          <Route path="/investigations/:id" element={<Investigation />} />
          <Route path="/agents" element={<AIAgents />} />
          <Route path="/architecture" element={<DataArchitecture />} />
          <Route path="/policy" element={<PolicyConfig />} />
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </InvestigationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
