import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "@/components/error-boundary";

// DEMO MODE bootstrap: si VITE_DEMO_MODE=true, instalamos un mock de fetch
// para /api/* y sembramos el usuario admin demo en localStorage antes de
// renderizar la app, de manera que los gates de auth pasen directo.
if (import.meta.env.VITE_DEMO_MODE === "true") {
  const { installDemoApi } = await import("@/lib/demo/mock-api");
  const { DEMO_ADMIN } = await import("@/lib/demo/seed-data");
  installDemoApi();
  try {
    localStorage.setItem("castores_real_user", JSON.stringify(DEMO_ADMIN));
  } catch {
    /* ignore */
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
