import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Story from "./pages/Story";
import Characters from "./pages/Characters";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import { AIAssistant } from "./components/ai/AIAssistant";
import { AIContextProvider } from "./context/AIContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AIContextProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/losk">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/story" element={<Story />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* AI Assistant - Available on all pages */}
          <AIAssistant />
        </BrowserRouter>
      </AIContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
