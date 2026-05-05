const supabase = require('../config/supabase');

// --- Entrevistas ---
const getEntrevistas = async (req, res) => {
  const { data, error } = await supabase.from('entrevistas').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

const createEntrevista = async (req, res) => {
  const { data, error } = await supabase.from('entrevistas').insert([req.body]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
};

// --- Fases ---
const getFases = async (req, res) => {
  const { data, error } = await supabase.from('fases').select('*').order('id', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// --- Campus Days ---
const getCampusDays = async (req, res) => {
  const { data, error } = await supabase.from('campus_days').select('*').order('id', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

const updateCampusDay = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('campus_days').update(req.body).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};

module.exports = {
  getEntrevistas,
  createEntrevista,
  getFases,
  getCampusDays,
  updateCampusDay
};
