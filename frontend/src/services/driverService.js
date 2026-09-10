import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

const driverService = {
  async getAllDrivers() {
    return unwrap(await api.get("/drivers"));
  },
  async getDriverById(id) {
    return unwrap(await api.get(`/drivers/${id}`));
  },
  async createDriver(payload) {
    return unwrap(await api.post("/drivers", payload));
  },
  async updateDriver(id, payload) {
    return unwrap(await api.put(`/drivers/${id}`, payload));
  },
  async deleteDriver(id) {
    return unwrap(await api.delete(`/drivers/${id}`));
  },
  async list() {
    return this.getAllDrivers();
  },
};

export default driverService;
