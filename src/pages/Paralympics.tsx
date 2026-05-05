import DashboardLayout from "@/components/DashboardLayout";
import MedalDashboard from "@/components/MedalDashboard";
import SportsPage from "@/pages/SportsPage";
import { Route, Routes } from "react-router-dom";

const Paralympics = () => (
  <DashboardLayout variant="paralympics">
    <Routes>
      <Route
        path="dashboard"
        element={
          <MedalDashboard
            type="paralympics"
            variant="paralympics"
            title="Paralympics Data"
            subtitle="Team USA medal performance across the Paralympic Games."
          />
        }
      />
      <Route path="sports" element={<SportsPage type="paralympics" />} />
      <Route path="*" element={
        <MedalDashboard
          type="paralympics"
          variant="paralympics"
          title="Paralympics Data"
          subtitle="Team USA medal performance across the Paralympic Games."
        />
      } />
    </Routes>
  </DashboardLayout>
);

export default Paralympics;
