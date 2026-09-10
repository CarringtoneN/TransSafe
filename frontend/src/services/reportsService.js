import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

const reportsService = {
  async summary(params = {}) {
    return unwrap(await api.get("/reports/summary", { params }));
  },

  async data(params = {}) {
    return unwrap(await api.get("/reports/data", { params }));
  },

  async vehicles() {
    return unwrap(await api.get("/reports/vehicles"));
  },
};

export default reportsService;
