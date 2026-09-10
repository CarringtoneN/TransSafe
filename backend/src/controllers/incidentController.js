import { ZodError } from "zod";
import incidentService from "../services/incidentService.js";

function handleError(res, error) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Please correct the highlighted incident fields.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error?.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "The selected vehicle or driver is no longer available.",
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({ success: false, message: "Incident not found." });
  }

  return res.status(500).json({
    success: false,
    message: error?.message || "An unexpected server error occurred.",
  });
}

class IncidentController {
  async getAllIncidents(req, res) {
    try {
      const incidents = await incidentService.getAllIncidents();
      return res.status(200).json({ success: true, data: incidents });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getIncidentById(req, res) {
    try {
      const incident = await incidentService.getIncidentById(req.params.id);
      if (!incident) {
        return res.status(404).json({ success: false, message: "Incident not found." });
      }
      return res.status(200).json({ success: true, data: incident });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async createIncident(req, res) {
    try {
      const incident = await incidentService.createIncident(req.body);
      return res.status(201).json({
        success: true,
        message: "Incident created successfully.",
        data: incident,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async updateIncident(req, res) {
    try {
      const incident = await incidentService.updateIncident(req.params.id, req.body);
      if (!incident) {
        return res.status(404).json({ success: false, message: "Incident not found." });
      }
      return res.status(200).json({
        success: true,
        message: "Incident updated successfully.",
        data: incident,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async deleteIncident(req, res) {
    try {
      const incident = await incidentService.deleteIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ success: false, message: "Incident not found." });
      }
      return res.status(200).json({
        success: true,
        message: "Incident deleted successfully.",
      });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new IncidentController();
