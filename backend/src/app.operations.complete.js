import express from "express";
import cors from "cors";

import vehicleRoutes from "./routes/vehicleRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import inspectionRoutes from "./routes/inspectionRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";

import tripRoutes from "./routes/tripRoutes.js";
import operationsRoutes from "./routes/operationsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚛 TransSafe Backend Running",
    version: "1.0.0",
  });
});

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/fuel-records", fuelRoutes);
app.use("/api/documents", documentRoutes);

app.use("/api/drivers", driverRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/shifts", shiftRoutes);

app.use("/api/inspections", inspectionRoutes);
app.use("/api/incidents", incidentRoutes);

app.use("/api/trips", tripRoutes);
app.use("/api/operations", operationsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("[Express]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

export default app;
