import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react") || id.includes("/node_modules/react-dom")) return "react-vendor";
          if (id.includes("node_modules/react-router") || id.includes("node_modules/@remix-run/router")) return "router";
          if (id.includes("node_modules/@radix-ui/")) return "ui-vendor";
          if (id.includes("node_modules/@supabase/supabase-js")) return "supabase";
          if (id.includes("node_modules/recharts") || id.includes("src/pages/CRM") || id.includes("src/components/crm")) return "charts-admin";
        },
      },
    },
  },
}));
