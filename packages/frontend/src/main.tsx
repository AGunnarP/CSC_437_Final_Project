import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

//element by id needs to be react-root in production and root for dev
createRoot(document.getElementById('react-root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
