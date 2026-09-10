import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

const vehicleService = {
  async getAllVehicles() {
    return unwrap(await api.get("/vehicles"));
  },
  async getVehicleById(id) {
    return unwrap(await api.get(`/vehicles/${id}`));
  },
  async createVehicle(payload) {
    return unwrap(await api.post("/vehicles", payload));
  },
  async updateVehicle(id, payload) {
    return unwrap(await api.put(`/vehicles/${id}`, payload));
  },
  async getHistory(id) { return unwrap(await api.get(`/vehicles/${id}/history`)); },
  async deleteVehicle(id) {
    return unwrap(await api.delete(`/vehicles/${id}`));
  },
  async list() {
    return this.getAllVehicles();
  },
};

export default vehicleService;
