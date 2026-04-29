import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

const isAppSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("app.");

export const Layout = ({ children }: { children: ReactNode }) => {
  if (isAppSubdomain) {
    return <div className="min-h-screen bg-slate-50 text-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
