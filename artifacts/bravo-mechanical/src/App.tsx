import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, Route, RouterProvider, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import { NavigationEffects } from "./components/NavigationEffects";
import { StickyMobileCTA } from "./components/StickyMobileCTA";

// Eager: home page (Index) loads immediately on first paint.
// Everything else is route-split so the initial bundle stays small.
const About = lazy(() => import("./pages/About.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.tsx"));
const ServiceCityPage = lazy(() => import("./pages/ServiceCityPage.tsx"));
const ServiceAreas = lazy(() => import("./pages/ServiceAreas.tsx"));
const CityPage = lazy(() => import("./pages/CityPage.tsx"));
const Reviews = lazy(() => import("./pages/Reviews.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const EmergencyHVAC = lazy(() => import("./pages/EmergencyHVAC.tsx"));
const Financing = lazy(() => import("./pages/Financing.tsx"));
const BookOnline = lazy(() => import("./pages/BookOnline.tsx"));
const Projects = lazy(() => import("./pages/Projects.tsx"));
const EsHome = lazy(() => import("./pages/es/EsHome.tsx"));
const EsContact = lazy(() => import("./pages/es/EsContact.tsx"));
const EsBook = lazy(() => import("./pages/es/EsBook.tsx"));
const EsEmergency = lazy(() => import("./pages/es/EsEmergency.tsx"));
const MaintenancePlans = lazy(() => import("./pages/MaintenancePlans.tsx"));
const CompanyFacts = lazy(() => import("./pages/CompanyFacts.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const AdminComments = lazy(() => import("./pages/AdminComments.tsx"));
const CRM = lazy(() => import("./pages/CRM.tsx"));
const ProposalView = lazy(() => import("./pages/ProposalView.tsx"));

const queryClient = new QueryClient();

const isAppSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("app.");

// Loading spinner shown while lazy route chunks are downloading
const PageLoader = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
    <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #0b3a66", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
  </div>
);

const AppRoutes = () => {
  if (isAppSubdomain) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/admin/crm" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/crm" element={<CRM />} />
        <Route path="/admin/comments" element={<Navigate to="/admin/crm" replace />} />
        <Route path="/proposal/:token" element={<ProposalView />} />
        <Route path="*" element={<Navigate to="/admin/crm" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:serviceSlug/:citySlug" element={<ServiceCityPage />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />
      <Route path="/service-areas" element={<ServiceAreas />} />
      <Route path="/service-areas/:slug" element={<CityPage />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/proposal/:token" element={<ProposalView />} />
      <Route path="/admin/comments" element={<AdminComments />} />
      <Route path="/admin/crm" element={<CRM />} />
      <Route path="/emergency-hvac-westchester" element={<EmergencyHVAC />} />
      <Route path="/financing" element={<Financing />} />
      <Route path="/book" element={<BookOnline />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/es" element={<EsHome />} />
      <Route path="/es/contacto" element={<EsContact />} />
      <Route path="/es/reservar" element={<EsBook />} />
      <Route path="/es/emergencia" element={<EsEmergency />} />
      <Route path="/maintenance-plans" element={<MaintenancePlans />} />
      <Route path="/company-facts" element={<CompanyFacts />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppRouterShell = () => (
  <>
    <NavigationEffects />
    <Suspense fallback={<PageLoader />}>
      <AppRoutes />
    </Suspense>
    {!isAppSubdomain && <StickyMobileCTA />}
  </>
);

// A data-router shell preserves the existing JSX route table while enabling
// useBlocker for recoverable forms rendered anywhere beneath it.
const router = createBrowserRouter([{ path: "*", element: <AppRouterShell /> }]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
