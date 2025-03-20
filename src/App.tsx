
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Hawker Pages
import HawkerLogin from "./pages/Hawker/Login";
import HawkerDashboard from "./pages/Hawker/Dashboard";
import HawkerMenuEditor from "./pages/Hawker/MenuEditor";

// Customer Pages
import CustomerMenu from "./pages/Customer/Menu";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.main
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen pt-16 md:pt-20" // Account for the fixed navbar
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                
                {/* Hawker Routes */}
                <Route path="/hawker/login" element={<HawkerLogin />} />
                <Route path="/hawker/dashboard" element={<HawkerDashboard />} />
                <Route path="/hawker/menu" element={<HawkerMenuEditor />} />
                <Route path="/hawker/orders" element={<HawkerDashboard />} />
                
                {/* Customer Routes */}
                <Route path="/stall/:stallId" element={<CustomerMenu />} />
                
                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
