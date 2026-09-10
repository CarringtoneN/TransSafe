import api from "./api";

class InspectionService {

  async getAllInspections() {

    const response = await api.get("/inspections");

    return response.data.data;

  }

  async getInspection(id) {

    const response = await api.get(`/inspections/${id}`);

    return response.data.data;

  }

  async createInspection(data) {

    const response = await api.post("/inspections", data);

    return response.data.data;

  }

  async updateInspection(id, data) {

    const response = await api.put(`/inspections/${id}`, data);

    return response.data.data;

  }

  async deleteInspection(id) {

    const response = await api.delete(`/inspections/${id}`);

    return response.data;

  }

}

export default new InspectionService();