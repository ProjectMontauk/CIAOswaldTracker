import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import PredictionPage from "./pages/PredictionPage";
import PredictionMarketsPage from "./pages/PredictionMarketsPage";
import CreateMarketPage from "./pages/CreateMarketPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/markets" component={PredictionMarketsPage} />
          <Route path="/predict/:id" component={PredictionPage} />
          <Route path="/markets/create" component={CreateMarketPage} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;