import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initializeMonitoring } from "./lib/monitoring";
import "./index.css";

initializeMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
