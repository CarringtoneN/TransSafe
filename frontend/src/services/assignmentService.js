import axios from "axios";

const API_URL = "http://localhost:5000/api/assignments";

async function getAllAssignments() {
  const response = await axios.get(API_URL);
  return response.data.data;
}

async function getAssignment(id) {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
}

async function createAssignment(assignment) {
  const response = await axios.post(
    API_URL,
    assignment
  );

  return response.data.data;
}

async function updateAssignment(id, assignment) {
  const response = await axios.put(
    `${API_URL}/${id}`,
    assignment
  );

  return response.data.data;
}

async function deleteAssignment(id) {
  const response = await axios.delete(
    `${API_URL}/${id}`
  );

  return response.data;
}

export default {
  getAllAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};