import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker update handler
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // New service worker activated — show update toast
    const event = new CustomEvent("sw-updated");
    window.dispatchEvent(event);
  });
}

// Pause animations when tab is hidden for performance
document.addEventListener("visibilitychange", () => {
  document.documentElement.style.setProperty(
    "--animation-play-state",
    document.hidden ? "paused" : "running"
  );
});

createRoot(document.getElementById("root")!).render(<App />);
