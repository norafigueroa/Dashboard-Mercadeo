import api from './api';

const ENDPOINT = '/entrevistas';

export const getEntrevistas = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

export const createEntrevista = async (entrevista) => {
  const response = await api.post(ENDPOINT, entrevista);
  return response.data;
};

export const updateEntrevista = async (id, entrevista) => {
  const response = await api.put(`${ENDPOINT}/${id}`, entrevista);
  return response.data;
};

export const deleteEntrevista = async (id) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};

export const getFases = async () => {
  const response = await api.get(`${ENDPOINT}/fases`);
  return response.data;
};

export const getCampusDays = async () => {
  const response = await api.get(`${ENDPOINT}/campus-days`);
  return response.data;
};

export const updateCampusDay = async (id, data) => {
  const response = await api.patch(`${ENDPOINT}/campus-days/${id}`, data);
  return response.data;
};
