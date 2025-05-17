import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";


import { App } from "./App";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <App />
  </StrictMode>
);
