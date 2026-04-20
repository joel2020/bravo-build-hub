import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Services from "./pages/Services.tsx";
import NYSystem from "./pages/NYSystem.tsx";
import ServiceCityPage from "./pages/ServiceCityPage.tsx";
import ServiceAreas from "./pages/ServiceAreas.tsx";
import CityPage from "./pages/CityPage.tsx";
import Reviews from "./pages/Reviews.tsx";
import Contact from "./pages/Contact.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Auth from "./pages/Auth.tsx";
import AdminComments from "./pages/AdminComments.tsx";
import EmergencyHVAC from "./pages/EmergencyHVAC.tsx";
import NotFound from "./pages/NotFound.tsx";
import { StickyMobileCTA } from "./components/StickyMobileCTA";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceSlug/:citySlug" element={<ServiceCityPage />} />
          <Route path="/services/:slug" element={<NYSystem />} />
          <Route path="/service-areas" element={<ServiceAreas />} />
          <Route path="/service-areas/:slug" element={<CityPage />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/emergency-hvac-westchester" element={<EmergencyHVAC />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <StickyMobileCTA />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
