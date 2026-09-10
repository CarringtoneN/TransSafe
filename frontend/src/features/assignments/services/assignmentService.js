import api from "../../../services/api";

class AssignmentService {
  getAll() {
    return api.get("/assignments");
  }

  getById(id) {
    return api.get(`/assignments/${id}`);
  }

  create(data) {
    return api.post("/assignments", data);
  }

  update(id, data) {
    return api.put(`/assignments/${id}`, data);
  }

  delete(id) {
    return api.delete(`/assignments/${id}`);
  }
}

export default new AssignmentService();