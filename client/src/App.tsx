import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import PredictionPage from "./pages/PredictionPage";

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/predict" component={PredictionPage} />
    </Switch>
  );
}

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );
}

export default AppWrapper;