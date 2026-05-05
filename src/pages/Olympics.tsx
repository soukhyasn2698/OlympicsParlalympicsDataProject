import DashboardLayout from "@/components/DashboardLayout";
import MedalDashboard from "@/components/MedalDashboard";
import SportsPage from "@/pages/SportsPage";
import { Route, Routes } from "react-router-dom";

const Olympics = () => (
  <DashboardLayout variant="olympics">
    <Routes>
      <Route
        path="dashboard"
        element={
          <MedalDashboard
            type="olympics"
            variant="olympics"
            title="Olympics Data"
            subtitle="Team USA medal performance across the Olympic Games."
          />
        }
      />
      <Route path="sports" element={<SportsPage />} />
      <Route path="*" element={
        <MedalDashboard
          type="olympics"
          variant="olympics"
          title="Olympics Data"
          subtitle="Team USA medal performance across the Olympic Games."
        />
      } />
    </Routes>
  </DashboardLayout>
);

export default Olympics;
