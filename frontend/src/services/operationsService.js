import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const operationsService = {
  async listTrips(params = {}) {
    return unwrap(await api.get("/trips", { params }));
  },
  async getTrip(id) {
    return unwrap(await api.get(`/trips/${id}`));
  },
  async createTrip(payload) {
    return unwrap(await api.post("/trips", payload));
  },
  async updateTrip(id, payload) {
    return unwrap(await api.put(`/trips/${id}`, payload));
  },
  async deleteTrip(id) {
    return unwrap(await api.delete(`/trips/${id}`));
  },
  async listAllocations(params = {}) {
    return unwrap(await api.get("/operations/allocations", { params }));
  },
  async getAllocation(id) {
    return unwrap(await api.get(`/operations/allocations/${id}`));
  },
  async createAllocation(payload) {
    return unwrap(await api.post("/operations/allocations", payload));
  },
  async updateAllocation(id, payload) {
    return unwrap(await api.put(`/operations/allocations/${id}`, payload));
  },
  async deleteAllocation(id) {
    return unwrap(await api.delete(`/operations/allocations/${id}`));
  },
  async availability() {
    return unwrap(await api.get("/operations/availability"));
  },
  async listManifest(params = {}) {
    return unwrap(await api.get("/operations/manifest", { params }));
  },
  async getManifest(tripId) {
    return unwrap(await api.get(`/operations/manifest/${tripId}`));
  },
  async monitoring(params = {}) {
    return unwrap(await api.get("/operations/monitoring", { params }));
  },
};

export default operationsService;
