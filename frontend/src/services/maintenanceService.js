
import api from "./api";

const service = {
  async getDashboard() { return (await api.get("/maintenance/dashboard")).data.data; },
  async getReminders() { return (await api.get("/maintenance/reminders")).data.data; },
  async getApprovals(params={}) { return (await api.get("/maintenance/approvals",{params})).data.data; },
  async getServiceHistory(vehicleId) {
    const response = await api.get("/maintenance/service-history", { params: vehicleId ? { vehicleId } : {} });
    return response.data.data;
  },

  async getSchedules() { return (await api.get("/maintenance/schedules")).data.data; },
  async getSchedule(id) { return (await api.get(`/maintenance/schedules/${id}`)).data.data; },
  async createSchedule(data) { return (await api.post("/maintenance/schedules", data)).data.data; },
  async updateSchedule(id, data) { return (await api.put(`/maintenance/schedules/${id}`, data)).data.data; },
  async approveSchedule(id) { return (await api.post(`/maintenance/schedules/${id}/approve`)).data.data; },

  async deleteSchedule(id) { return (await api.delete(`/maintenance/schedules/${id}`)).data; },

  async getWorkOrders() { return (await api.get("/maintenance/work-orders")).data.data; },
  async getWorkOrder(id) { return (await api.get(`/maintenance/work-orders/${id}`)).data.data; },
  async createWorkOrder(data) { return (await api.post("/maintenance/work-orders", data)).data.data; },
  async updateWorkOrder(id, data) { return (await api.put(`/maintenance/work-orders/${id}`, data)).data.data; },
  async approveWorkOrder(id) { return (await api.post(`/maintenance/work-orders/${id}/approve`)).data.data; },
  async startWorkOrder(id) { return (await api.post(`/maintenance/work-orders/${id}/start`)).data.data; },

  async deleteWorkOrder(id) { return (await api.delete(`/maintenance/work-orders/${id}`)).data; },
  async completeWorkOrder(id, data = {}) { return (await api.post(`/maintenance/work-orders/${id}/complete`, data)).data.data; },
  async createIncidentTicket(incidentId, data = {}) { return (await api.post(`/maintenance/incidents/${incidentId}/ticket`, data)).data.data; },
  async resolveIncident(incidentId, data = {}) { return (await api.post(`/maintenance/incidents/${incidentId}/resolve`, data)).data.data; },

  async getRepairs() { return (await api.get("/maintenance/repairs")).data.data; },
  async getRepair(id) { return (await api.get(`/maintenance/repairs/${id}`)).data.data; },
  async createRepair(data) { return (await api.post("/maintenance/repairs", data)).data.data; },
  async updateRepair(id, data) { return (await api.put(`/maintenance/repairs/${id}`, data)).data.data; },
  async deleteRepair(id) { return (await api.delete(`/maintenance/repairs/${id}`)).data; },

  async getCompliance() { return (await api.get("/maintenance/compliance")).data.data; },
  async getComplianceItem(id) { return (await api.get(`/maintenance/compliance/${id}`)).data.data; },
  async createCompliance(data) { return (await api.post("/maintenance/compliance", data)).data.data; },
  async updateCompliance(id, data) { return (await api.put(`/maintenance/compliance/${id}`, data)).data.data; },
  async deleteCompliance(id) { return (await api.delete(`/maintenance/compliance/${id}`)).data; },
};

export default service;
