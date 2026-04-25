import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/leads", label: "Leads" },
  { to: "/dashboard/customers", label: "Customers" },
  { to: "/dashboard/jobs", label: "Jobs" },
  { to: "/dashboard/calendar", label: "Calendar" },
  { to: "/dashboard/content", label: "Content" },
  { to: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { roles, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="text-xl font-bold">Bravo CRM</Link>
            <p className="text-xs text-muted-foreground">Roles: {roles.join(", ") || "none"}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/">View Site</Link></Button>
            <Button size="sm" onClick={() => signOut()}>Sign out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
