import axios from 'axios';

const API_URL = 'http://localhost:3001/contactoInicial';

export const getContactos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createContacto = async (contacto) => {
  const response = await axios.post(API_URL, contacto);
  return response.data;
};

export const updateContacto = async (id, contacto) => {
  const response = await axios.put(`${API_URL}/${id}`, contacto);
  return response.data;
};

export const deleteContacto = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
