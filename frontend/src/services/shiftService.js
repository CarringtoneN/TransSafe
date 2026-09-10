import api from "./api";

class ShiftService {
  async getAllShifts() {
    const response = await api.get("/shifts");
    return response.data.data;
  }

  async getShift(id) {
    const response = await api.get(`/shifts/${id}`);
    return response.data.data;
  }

  async createShift(data) {
    const response = await api.post("/shifts", data);
    return response.data.data;
  }

  async updateShift(id, data) {
    const response = await api.put(`/shifts/${id}`, data);
    return response.data.data;
  }

  async deleteShift(id) {
    const response = await api.delete(`/shifts/${id}`);
    return response.data.data;
  }
}

export default new ShiftService();