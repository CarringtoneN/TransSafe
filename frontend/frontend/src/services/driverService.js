import axios from "axios";

const API_URL = "http://localhost:5000/api/drivers";

async function getAllDrivers() {
  const response = await axios.get(API_URL);
  return response.data.data;
}

async function getDriver(id) {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
}

async function createDriver(driver) {
  const response = await axios.post(API_URL, driver);
  return response.data.data;
}

async function updateDriver(id, driver) {
  const response = await axios.put(`${API_URL}/${id}`, driver);
  return response.data.data;
}

async function deleteDriver(id) {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}

export default {
  getAllDrivers,
  list: getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
};