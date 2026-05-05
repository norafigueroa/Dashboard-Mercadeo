import api from './api';

const ENDPOINT = '/contactos';

export const getContactos = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

export const createContacto = async (contacto) => {
  const response = await api.post(ENDPOINT, contacto);
  return response.data;
};

export const updateContacto = async (id, contacto) => {
  const response = await api.put(`${ENDPOINT}/${id}`, contacto);
  return response.data;
};

export const deleteContacto = async (id) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};
