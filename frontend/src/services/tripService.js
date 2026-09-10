import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

const tripService = {
  async list(params = {}) {
    return unwrap(await api.get("/trips", { params }));
  },

  async get(id) {
    return unwrap(await api.get(`/trips/${id}`));
  },

  async create(payload) {
    return unwrap(await api.post("/trips", payload));
  },

  async update(id, payload) {
    return unwrap(await api.put(`/trips/${id}`, payload));
  },

  async remove(id) {
    return unwrap(await api.delete(`/trips/${id}`));
  },

  async dashboard() {
    return unwrap(await api.get("/trips/dashboard"));
  },

  async myTrips() { return unwrap(await api.get("/trips/my")); },
  async drivingStatus() { return unwrap(await api.get("/trips/my/driving-status")); },
  async availableDrivers(id) { return unwrap(await api.get(`/trips/${id}/available-drivers`)); },
  async start(id, payload = {}) { return unwrap(await api.post(`/trips/${id}/start`, payload)); },
  async pause(id, payload = {}) { return unwrap(await api.post(`/trips/${id}/pause`, payload)); },
  async resume(id, payload = {}) { return unwrap(await api.post(`/trips/${id}/resume`, payload)); },
  async end(id, payload = {}) { return unwrap(await api.post(`/trips/${id}/end`, payload)); },
  async changeDriver(id, payload = {}) { return unwrap(await api.post(`/trips/${id}/change-driver`, payload)); },
};

export default tripService;
