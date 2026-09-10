import api from "./api";

const fuelService = {
  async getAllFuelRecords() {
    const response = await api.get("/fuel-records");
    return response.data.data;
  },

  async getFuelRecordById(id) {
    const response = await api.get(`/fuel-records/${id}`);
    return response.data.data;
  },

  async createFuelRecord(record) {
    const response = await api.post("/fuel-records", record);
    return response.data.data;
  },

  async updateFuelRecord(id, record) {
    const response = await api.put(`/fuel-records/${id}`, record);
    return response.data.data;
  },

  async deleteFuelRecord(id) {
    const response = await api.delete(`/fuel-records/${id}`);
    return response.data;
  },
};

export default fuelService;