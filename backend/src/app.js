import express from "express";
import cors from "cors";

const app = express();

// ======================================================
// CORS CONFIGURATION
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://trans-safe-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no Origin header
      // (Thunder Client, Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());

// ======================================================
// ROOT ENDPOINT
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚛 TransSafe Backend Running",
    version: "1.0.0",
  });
});

// ======================================================
// FLEET MANAGEMENT
// ======================================================

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/fuel-records", fuelRoutes);
app.use("/api/documents", documentRoutes);

// ======================================================
// DRIVER MANAGEMENT
// ======================================================

app.use("/api/drivers", driverRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/incidents", incidentRoutes);

// ======================================================
// MAINTENANCE & COMPLIANCE
// ======================================================

app.use("/api/maintenance", maintenanceRoutes);

// ======================================================
// REPORTS
// ======================================================

app.use("/api/reports", reportsRoutes);

// ======================================================
// AUTHENTICATION & USERS
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/me", meRoutes);

// ======================================================
// ALERTS
// ======================================================

app.use("/api/alerts", alertsRoutes);

// ======================================================
// OPERATIONS
// ======================================================

app.use("/api/trips", tripRoutes);
app.use("/api/operations", operationsRoutes);

// ======================================================
// EXPORT
// ======================================================

export default app;