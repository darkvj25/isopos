import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/pos/AuthGuard";
import { PosLayout } from "@/components/pos/PosLayout";
import { Dashboard } from "@/components/pos/Dashboard";
import { PosTerminal } from "@/components/pos/PosTerminal";
import { ProductManagement } from "@/components/pos/ProductManagement";
import { InventoryManagement } from "@/components/pos/InventoryManagement";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { Reports } from "@/components/pos/Reports";
import { Settings } from "@/components/pos/Settings";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <PosLayout>
                <Dashboard />
              </PosLayout>
            </AuthGuard>
          } />
          <Route path="/pos" element={
            <AuthGuard>
              <PosLayout>
                <PosTerminal />
              </PosLayout>
            </AuthGuard>
          } />
          <Route path="/products" element={
            <AuthGuard requiredRole="admin">
              <PosLayout>
                <ProductManagement />
              </PosLayout>
            </AuthGuard>
          } />
          <Route path="/inventory" element={
            <AuthGuard>
              <PosLayout>
                <InventoryManagement />
              </PosLayout>
            </AuthGuard>
          } />
          <Route path="/sales" element={
            <AuthGuard>
              <PosLayout>
                <SalesHistory />
              </PosLayout>
            </AuthGuard>
          } />
          <Route path="/reports" element={
            <AuthGuard requiredRole="admin">
              <PosLayout>
                <Reports />
              </PosLayout>
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard requiredRole="admin">
              <PosLayout>
                <Settings />
              </PosLayout>
            </AuthGuard>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
