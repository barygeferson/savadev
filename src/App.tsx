import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Launch from "./pages/Launch";
import Index from "./pages/Index";
import IDEPage from "./pages/IDE";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Gist from "./pages/Gist";
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import { LaunchGate } from "./components/LaunchGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Countdown landing — always public */}
          <Route path="/" element={<Launch />} />
          {/* Auth must stay reachable so early-access users can sign in */}
          <Route path="/auth" element={<Auth />} />
          {/* Legal pages — always public */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Everything else is gated until launch or sign-in */}
          <Route path="/home" element={<LaunchGate><Index /></LaunchGate>} />
          <Route path="/ide" element={<LaunchGate><IDEPage /></LaunchGate>} />
          <Route path="/account" element={<LaunchGate><Account /></LaunchGate>} />
          <Route path="/g/:slug" element={<LaunchGate><Gist /></LaunchGate>} />
          <Route path="/docs" element={<LaunchGate><Docs /></LaunchGate>} />
          <Route path="/docs/:section" element={<LaunchGate><Docs /></LaunchGate>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
