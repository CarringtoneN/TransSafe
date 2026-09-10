import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

// Dashboard
import Dashboard from "../pages/Dashboard/Dashboard";

// Fleet Management
import Vehicles from "../pages/FleetManagement/Vehicles";
import FleetAssets from "../pages/FleetManagement/FleetAssets";
import FuelRecords from "../pages/FleetManagement/FuelRecords";
import Documents from "../pages/FleetManagement/Documents";

// Driver Management
import Drivers from "../pages/DriverManagement/Drivers";
import Assignments from "../pages/DriverManagement/Assignments";
import Shifts from "../pages/DriverManagement/Shifts";
import VehicleInspections from "../pages/DriverManagement/VehicleInspections";
import IncidentReports from "../pages/DriverManagement/IncidentReports";

import Trips from "../pages/Operations/Trips";
import VehicleAllocation from "../pages/Operations/VehicleAllocation";
import DriverAllocation from "../pages/Operations/DriverAllocation";
import Manifest from "../pages/Operations/Manifest";
import Monitoring from "../pages/Operations/Monitoring";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          {/* Dashboard */}

          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Fleet Management */}

          <Route
            path="/vehicles"
            element={<Vehicles />}
          />

          <Route
            path="/fleet-assets"
            element={<FleetAssets />}
          />

          <Route
            path="/fuel-records"
            element={<FuelRecords />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          {/* Driver Management */}

          <Route
            path="/drivers"
            element={<Drivers />}
          />

          <Route
            path="/assignments"
            element={<Assignments />}
          />

          <Route
            path="/shifts"
            element={<Shifts />}
          />

          <Route
            path="/inspections"
            element={<VehicleInspections />}
          />


          {/* Operations */}
          <Route path="/trips" element={<Trips />} />
          <Route path="/vehicle-allocation" element={<VehicleAllocation />} />
          <Route path="/driver-allocation" element={<DriverAllocation />} />
          <Route path="/manifest" element={<Manifest />} />
          <Route path="/monitoring" element={<Monitoring />} />

          {/* Incident Reports */}

          <Route
            path="/incidents"
            element={<IncidentReports />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;