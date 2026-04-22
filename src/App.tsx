import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Wallet from "./pages/Wallet.tsx";
import Travel from "./pages/Travel.tsx";
import Studio from "./pages/Studio.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Settings from "./pages/Settings.tsx";
import { useAuthBootstrap } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useAuthBootstrap();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/wallet"      element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/fintech"     element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/travel"      element={<ProtectedRoute><Travel /></ProtectedRoute>} />
      <Route path="/studio"      element={<ProtectedRoute><Studio /></ProtectedRoute>} />
      <Route path="/media"       element={<ProtectedRoute><Studio /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
