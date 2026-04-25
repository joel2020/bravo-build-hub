import { Navigate, useLocation } from "react-router-dom";
import { hasAnyRole, useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

type Role = "admin" | "office" | "office_staff" | "tech" | "marketing" | "user";

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) => {
  const { isAuthenticated, loading, roles } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !hasAnyRole(roles, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
