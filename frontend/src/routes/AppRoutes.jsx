import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { AuthProvider } from "../context/AuthContext";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserManagement from "../pages/Admin/UserManagement";
import RoleDashboard from "../pages/UserDashboard/RoleDashboard";
import DriverProfile from "../pages/UserDashboard/DriverProfile";
import DriverResource from "../pages/UserDashboard/DriverResource";
import DriverTrips from "../pages/UserDashboard/DriverTrips";
import { ProtectedRoute, RoleRoute } from "./ProtectedRoute";

import Vehicles from "../pages/FleetManagement/Vehicles";
import FleetAssets from "../pages/FleetManagement/FleetAssets";
import FuelRecords from "../pages/FleetManagement/FuelRecords";
import Documents from "../pages/FleetManagement/Documents";
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
import Maintenance from "../pages/Maintenance/Maintenance";
import MaintenanceSchedule from "../pages/Maintenance/MaintenanceSchedule";
import WorkOrders from "../pages/Maintenance/WorkOrders";
import Repairs from "../pages/Maintenance/Repairs";
import ServiceHistory from "../pages/Maintenance/ServiceHistory";
import Compliance from "../pages/Maintenance/Compliance";
import Reports from "../pages/Reports/Reports";
import ApprovalReport from "../pages/Reports/ApprovalReport";

const secured = (element) => <ProtectedRoute><RoleRoute>{element}</RoleRoute></ProtectedRoute>;

function AppRoutes() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route path="/" element={secured(<Dashboard />)} />
      <Route path="/admin/users" element={secured(<UserManagement />)} />
      <Route path="/driver-dashboard" element={secured(<RoleDashboard role="DRIVER" />)} />
      <Route path="/fleet-dashboard" element={secured(<RoleDashboard role="FLEET_MANAGER" />)} />
      <Route path="/operations-dashboard" element={secured(<RoleDashboard role="OPERATIONS_MANAGER" />)} />
      <Route path="/maintenance-dashboard" element={secured(<RoleDashboard role="MAINTENANCE_COMPLIANCE" />)} />
      <Route path="/mechanic-dashboard" element={secured(<RoleDashboard role="TECHNICIAN_MECHANIC" />)} />
      <Route path="/driver-profile" element={secured(<DriverProfile />)} />
      <Route path="/my-trips" element={secured(<DriverTrips />)} />
      <Route path="/my-assignments" element={secured(<DriverResource resource="assignments" />)} />
      <Route path="/my-shifts" element={secured(<DriverResource resource="shifts" />)} />
      <Route path="/my-inspections" element={secured(<DriverResource resource="inspections" />)} />
      <Route path="/my-incidents" element={secured(<DriverResource resource="incidents" />)} />

      <Route path="/vehicles" element={secured(<Vehicles />)} /><Route path="/fleet-assets" element={secured(<FleetAssets />)} /><Route path="/fuel-records" element={secured(<FuelRecords />)} /><Route path="/documents" element={secured(<Documents />)} />
      <Route path="/drivers" element={secured(<Drivers />)} /><Route path="/assignments" element={secured(<Assignments />)} /><Route path="/shifts" element={secured(<Shifts />)} /><Route path="/inspections" element={secured(<VehicleInspections />)} /><Route path="/incidents" element={secured(<IncidentReports />)} />
      <Route path="/trips" element={secured(<Trips />)} /><Route path="/vehicle-allocation" element={secured(<VehicleAllocation />)} /><Route path="/driver-allocation" element={secured(<DriverAllocation />)} /><Route path="/manifest" element={secured(<Manifest />)} /><Route path="/monitoring" element={secured(<Monitoring />)} />
      <Route path="/maintenance" element={secured(<Maintenance />)} /><Route path="/maintenance-schedule" element={secured(<MaintenanceSchedule />)} /><Route path="/work-orders" element={secured(<WorkOrders />)} /><Route path="/repairs" element={secured(<Repairs />)} /><Route path="/service-history" element={secured(<ServiceHistory />)} /><Route path="/compliance" element={secured(<Compliance />)} />
      <Route path="/reports" element={secured(<Reports />)} />
      <Route path="/approval-report" element={secured(<ApprovalReport />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes></BrowserRouter></AuthProvider>;
}
export default AppRoutes;
