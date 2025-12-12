import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { DataProvider } from "@/contexts/DataContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Overview from "./pages/Overview";
import Upload from "./pages/Upload";
import Scoring from "./pages/Scoring";
import Segmentation from "./pages/Segmentation";
import LowRiskProfile from "./pages/LowRiskProfile";
import RiskLab from "./pages/RiskLab";
import PricingSimulator from "./pages/PricingSimulator";
import Fairness from "./pages/Fairness";
import Reports from "./pages/Reports";
import Documentation from "./pages/Documentation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/scoring" element={<Scoring />} />
                <Route path="/segmentation" element={<Segmentation />} />
                <Route path="/low-risk" element={<LowRiskProfile />} />
                <Route path="/risk-lab" element={<RiskLab />} />
                <Route path="/pricing" element={<PricingSimulator />} />
                <Route path="/fairness" element={<Fairness />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </DataProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
