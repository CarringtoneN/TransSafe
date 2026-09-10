import api from "./api";

const alertsService = {
  async getOperationalAlerts() {
    const response = await api.get("/alerts");
    return response.data.data;
  },
};

export default alertsService;
