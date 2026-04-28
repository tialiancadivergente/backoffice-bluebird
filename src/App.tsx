import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardPage from "@/pages/DashboardPage";
import LeadCapturePage from "@/pages/LeadCapturePage";
import VoteCampaignsPage from "@/pages/VoteCampaignsPage";
import VoteCampaignDetailPage from "@/pages/VoteCampaignDetailPage";
import VoteCampaignResultsPage from "@/pages/VoteCampaignResultsPage";
import LaunchPage from "@/pages/LaunchPage";
import LaunchDashboardPage from "@/pages/LaunchDashboardPage";
import SeasonPage from "@/pages/SeasonPage";
import FormPage from "@/pages/FormPage";
import FormDetailPage from "@/pages/FormDetailPage";
import MarketingSyncAdminPage from "@/pages/admin/MarketingSyncAdminPage";
import MarketingSyncConfigurationsPage from "@/pages/admin/MarketingSyncConfigurationsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="core-backoffice-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/lead-capture" element={<LeadCapturePage />} />
              <Route path="/vote-campaigns" element={<VoteCampaignsPage />} />
              <Route path="/vote-campaigns/:id/results" element={<VoteCampaignResultsPage />} />
              <Route path="/vote-campaigns/:id" element={<VoteCampaignDetailPage />} />
              <Route path="/launch-dashboard" element={<LaunchDashboardPage />} />
              <Route path="/launch" element={<LaunchPage />} />
              <Route path="/season" element={<SeasonPage />} />
              <Route path="/forms" element={<FormPage />} />
              <Route path="/forms/:id" element={<FormDetailPage />} />
              <Route path="/admin/integracoes/marketing-sync" element={<MarketingSyncAdminPage />} />
              <Route path="/admin/integracoes/marketing-sync/configuracoes" element={<MarketingSyncConfigurationsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
