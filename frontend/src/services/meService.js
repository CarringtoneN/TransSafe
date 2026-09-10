import api from "./api";

const meService = {
  dashboard: () => api.get("/me/driver-dashboard"),
  resource: (resource) => api.get(`/me/driver/${resource}`),
  startShift: (payload) => api.post("/me/driver/start-shift", payload),
  endShift: () => api.post("/me/driver/end-shift"),
  createInspection: (payload) => api.post("/me/driver/inspections", payload),
  createIncident: (payload) => api.post("/me/driver/incidents", payload),
};

export default meService;
