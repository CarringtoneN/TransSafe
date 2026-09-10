import axios from "axios";

const API = "http://localhost:5000/api/assignments";

export const getAssignments = () => axios.get(API);

export const createAssignment = (data) =>
  axios.post(API, data);

export const updateAssignment = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteAssignment = (id) =>
  axios.delete(`${API}/${id}`);