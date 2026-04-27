import axios from 'axios';

const API_URL = 'http://localhost:3001/generaciones';

export const getGeneraciones = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const updateGeneracion = async (id, data) => {
  const response = await axios.patch(`${API_URL}/${id}`, data);
  return response.data;
};
