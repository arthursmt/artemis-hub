import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import LauncherHome from "@/pages/LauncherHome";
import EmbeddedAppPage from "@/pages/EmbeddedAppPage";
import Home from "@/pages/Home";
import OnGoingProposals from "@/pages/OnGoingProposals";
import UnderEvaluationProposals from "@/pages/UnderEvaluationProposals";
import CompletedProposals from "@/pages/CompletedProposals";
import RenewalsScreen from "@/pages/RenewalsScreen";
import CollectionsScreen from "@/pages/CollectionsScreen";
import NewProposalScreen from "@/pages/NewProposalScreen";
import CreditValidationScreen from "@/pages/CreditValidationScreen";
import ProductConfigScreen from "@/pages/ProductConfigScreen";
import ProposalDetailsPage from "@/pages/ProposalDetailsPage";

import { ProposalProvider } from "@/lib/proposalStore";

function Router() {
  return (
    <Switch>
      {/* Launcher Routes */}
      <Route path="/" component={LauncherHome} />
      <Route path="/hunt">{() => <EmbeddedAppPage type="hunt" />}</Route>
      <Route path="/gate">{() => <EmbeddedAppPage type="gate" />}</Route>
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Home} />
      <Route path="/ongoing" component={OnGoingProposals} />
      <Route path="/under-evaluation" component={UnderEvaluationProposals} />
      <Route path="/completed" component={CompletedProposals} />
      <Route path="/renewals" component={RenewalsScreen} />
      <Route path="/collections" component={CollectionsScreen} />
      <Route path="/new-proposal" component={NewProposalScreen} />
      <Route path="/credit-validation" component={CreditValidationScreen} />
      <Route path="/product-config" component={ProductConfigScreen} />
      <Route path="/product-config/:id" component={ProductConfigScreen} />
      <Route path="/ongoing/:id/details" component={ProposalDetailsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProposalProvider>
          <Toaster />
          <Router />
        </ProposalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
