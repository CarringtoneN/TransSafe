import api from "./api";

const unwrap = (response) => response.data?.data ?? response.data;

const operationsService = {
  async getLookups() {
    return unwrap(await api.get("/operations/lookups"));
  },

  async listTrips(params = {}) {
    return unwrap(await api.get("/operations/trips", { params }));
  },
  async getTrip(id) {
    return unwrap(await api.get(`/operations/trips/${id}`));
  },
  async createTrip(data) {
    return unwrap(await api.post("/operations/trips", data));
  },
  async updateTrip(id, data) {
    return unwrap(await api.put(`/operations/trips/${id}`, data));
  },
  async deleteTrip(id) {
    return await api.delete(`/operations/trips/${id}`).then((r) => r.data);
  },

  async listVehicleAllocations(params = {}) {
    return unwrap(await api.get("/operations/vehicle-allocations", { params }));
  },
  async getVehicleAllocation(id) {
    return unwrap(await api.get(`/operations/vehicle-allocations/${id}`));
  },
  async createVehicleAllocation(data) {
    return unwrap(await api.post("/operations/vehicle-allocations", data));
  },
  async updateVehicleAllocation(id, data) {
    return unwrap(await api.put(`/operations/vehicle-allocations/${id}`, data));
  },
  async deleteVehicleAllocation(id) {
    return await api.delete(`/operations/vehicle-allocations/${id}`).then((r) => r.data);
  },

  async listDriverAllocations(params = {}) {
    return unwrap(await api.get("/operations/driver-allocations", { params }));
  },
  async getDriverAllocation(id) {
    return unwrap(await api.get(`/operations/driver-allocations/${id}`));
  },
  async createDriverAllocation(data) {
    return unwrap(await api.post("/operations/driver-allocations", data));
  },
  async updateDriverAllocation(id, data) {
    return unwrap(await api.put(`/operations/driver-allocations/${id}`, data));
  },
  async deleteDriverAllocation(id) {
    return await api.delete(`/operations/driver-allocations/${id}`).then((r) => r.data);
  },

  async listManifests(params = {}) {
    return unwrap(await api.get("/operations/manifests", { params }));
  },
  async getManifest(id) {
    return unwrap(await api.get(`/operations/manifests/${id}`));
  },

  async listMonitoring() {
    return unwrap(await api.get("/operations/monitoring"));
  },
  async updateMonitoringStatus(id, status) {
    return unwrap(await api.patch(`/operations/monitoring/${id}/status`, { status }));
  },
};

export default operationsService;
