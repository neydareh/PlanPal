import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "@neydareh/ui";
import { TooltipProvider } from "@neydareh/ui";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Calendar from "@/pages/calendar";
import Songs from "@/pages/songs";
import Blockouts from "@/pages/blockouts";
import Orgs from "@/pages/orgs";
import OrgDetail from "@/pages/org-detail";
import TeamDetail from "@/pages/team-detail";
import { AuthContextProvider, useAuthContext } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useOrgContext } from "@/hooks/useOrgContext";

function App() {
  return (
    <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthContextProvider>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated, isTokenReady } = useAuthContext();

  if (isLoading || (isAuthenticated && !isTokenReady)) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  // const OrgRedirect = ({
  //   target,
  // }: {
  //   target: "dashboard" | "calendar" | "songs" | "blockouts";
  // }) => {
  //   const { orgId } = useOrgContext();
  //   const [, setLocation] = useLocation();

  //   if (orgId) {
  //     void setLocation(`/orgs/${orgId}/${target}`);
  //   } else {
  //     void setLocation("/orgs");
  //   }

  //   return null;
  // };

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/songs" component={Songs} />
      <Route path="/blockouts" component={Blockouts} />
      <Route path="/orgs" component={Orgs} />
      <Route path="/orgs/:orgId" component={OrgDetail} />
      {/* <Route path="/orgs/:orgId/dashboard" component={Home} />
      <Route path="/orgs/:orgId/calendar" component={Calendar} />
      <Route path="/orgs/:orgId/songs" component={Songs} />
      <Route path="/orgs/:orgId/blockouts" component={Blockouts} />
      <Route path="/orgs/:orgId/teams/:teamId" component={TeamDetail} /> */}
      <Route path="/landing" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
