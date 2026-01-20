import { createRoot } from "react-dom/client";
import App from "./App";
import "@neydareh/ui/style.css";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

import "./index.css";
const kindeDomain = import.meta.env.VITE_KINDE_DOMAIN ?? "";
const kindeClientId = import.meta.env.VITE_KINDE_CLIENT_ID ?? "";
const kindeRedirectUrl =
  import.meta.env.VITE_KINDE_REDIRECT_URL ?? window.location.origin;
const kindeLogoutUrl =
  import.meta.env.VITE_KINDE_LOGOUT_URL ?? window.location.origin;
const kindeAudience = import.meta.env.VITE_KINDE_AUDIENCE ?? "";

createRoot(document.getElementById("root")!).render(
  <KindeProvider
    domain={kindeDomain}
    clientId={kindeClientId}
    redirectUri={kindeRedirectUrl}
    logoutUri={kindeLogoutUrl}
    audience={kindeAudience || undefined}
  >
    <App />
  </KindeProvider>
);
