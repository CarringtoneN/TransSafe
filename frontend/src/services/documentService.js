import axios from "axios";

const API_URL = "http://localhost:5000/api/documents";

async function getAllDocuments() {
  const response = await axios.get(API_URL);
  return response.data.data;
}

async function getDocument(id) {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
}

async function createDocument(document) {
  const response = await axios.post(API_URL, document);
  return response.data.data;
}

async function updateDocument(id, document) {
  const response = await axios.put(`${API_URL}/${id}`, document);
  return response.data.data;
}

async function deleteDocument(id) {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}

export default {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
};