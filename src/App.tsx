import { PlannerProvider } from "./context/PlannerContext";
import { AppShell } from "./components/layout/AppShell";
import "./App.css";

export default function App() {
  return (
    <PlannerProvider>
      <AppShell />
    </PlannerProvider>
  );
}
