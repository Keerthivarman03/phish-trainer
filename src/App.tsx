import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PhishingLogin from "./pages/PhishingLogin";
import AdminLogin from "./pages/AdminLogin";
import Campaigns from "./pages/admin/Campaigns";
import CampaignDetail from "./pages/admin/CampaignDetail";
import Analytics from "./pages/admin/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login" element={<PhishingLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Campaigns />} />
          <Route path="/admin/campaign/:id" element={<CampaignDetail />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
