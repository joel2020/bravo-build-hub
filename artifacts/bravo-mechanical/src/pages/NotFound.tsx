import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSeo } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();

  useSeo({
    title: "Page Not Found (404) | Bravo Mechanical",
    description: "The page you were looking for doesn't exist. Browse Bravo Mechanical's HVAC services for Westchester County, NY or return to the homepage.",
    noindex: true,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="mb-6 text-sm text-muted-foreground max-w-md">
          Try the <Link to="/services" className="text-primary underline">services</Link>,{" "}
          <Link to="/service-areas" className="text-primary underline">service areas</Link>, or{" "}
          <Link to="/blog" className="text-primary underline">blog</Link>.
        </p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
