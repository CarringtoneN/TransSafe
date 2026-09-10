import api from "./api";

const vehicleService = {
  async getAllVehicles() {
    const response = await api.get("/vehicles");
    return response.data.data;
  },

  async getVehicleById(id) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data.data;
  },

  async createVehicle(vehicle) {
    const response = await api.post("/vehicles", vehicle);
    return response.data.data;
  },

  async updateVehicle(id, vehicle) {
    const response = await api.put(`/vehicles/${id}`, vehicle);
    return response.data.data;
  },

  async deleteVehicle(id) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export default vehicleService;