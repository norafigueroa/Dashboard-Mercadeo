import axios from 'axios';

const API_URL_ENTREVISTAS = 'http://localhost:3001/entrevistas';
const API_URL_FASES = 'http://localhost:3001/fases';
const API_URL_CAMPUS = 'http://localhost:3001/campusDays';

export const getEntrevistas = async () => {
  const response = await axios.get(API_URL_ENTREVISTAS);
  return response.data;
};

export const createEntrevista = async (entrevista) => {
  const response = await axios.post(API_URL_ENTREVISTAS, entrevista);
  return response.data;
};

export const updateEntrevista = async (id, entrevista) => {
  const response = await axios.put(`${API_URL_ENTREVISTAS}/${id}`, entrevista);
  return response.data;
};

export const deleteEntrevista = async (id) => {
  const response = await axios.delete(`${API_URL_ENTREVISTAS}/${id}`);
  return response.data;
};

export const getFases = async () => {
  const response = await axios.get(API_URL_FASES);
  return response.data;
};

export const getCampusDays = async () => {
  const response = await axios.get(API_URL_CAMPUS);
  return response.data;
};

export const updateCampusDay = async (id, data) => {
  const response = await axios.patch(`${API_URL_CAMPUS}/${id}`, data);
  return response.data;
};
