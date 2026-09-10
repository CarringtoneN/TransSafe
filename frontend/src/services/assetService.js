import axios from "axios";

const API_URL = "http://localhost:5000/api/assets";

async function getAllAssets() {
  const response = await axios.get(API_URL);
  return response.data.data;
}

async function getAsset(id) {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
}

async function createAsset(asset) {
  const response = await axios.post(API_URL, asset);
  return response.data.data;
}

async function updateAsset(id, asset) {
  const response = await axios.put(`${API_URL}/${id}`, asset);
  return response.data.data;
}

async function deleteAsset(id) {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}

export default {
  getAllAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
};