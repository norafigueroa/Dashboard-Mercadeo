import api from './api';

const ENDPOINT = '/academica';

export const getGeneraciones = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

export const updateGeneracion = async (id, data) => {
  const response = await api.patch(`${ENDPOINT}/${id}`, data);
  return response.data;
};
