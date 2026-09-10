import api from "./api";

const incidentService = {
  async getAllIncidents() {
    const response = await api.get("/incidents");
    return response.data.data || [];
  },

  async getIncidentById(id) {
    const response = await api.get(`/incidents/${id}`);
    return response.data.data;
  },

  async createIncident(payload) {
    const response = await api.post("/incidents", payload);
    return response.data.data;
  },

  async updateIncident(id, payload) {
    const response = await api.put(`/incidents/${id}`, payload);
    return response.data.data;
  },

  async deleteIncident(id) {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  },

  async createMaintenanceTicket(id, payload = {}) {
    const response = await api.post(`/maintenance/incidents/${id}/ticket`, payload);
    return response.data.data;
  },

  async resolveIncident(id, payload = {}) {
    const response = await api.post(`/maintenance/incidents/${id}/resolve`, payload);
    return response.data.data;
  },
};

export default incidentService;
