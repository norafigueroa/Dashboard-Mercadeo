const supabase = require('../config/supabase');

const mapToCamel = (gen) => ({
  id: gen.id,
  nombre: gen.nombre,
  periodoPrueba: gen.periodo_prueba,
  semanaPrueba: gen.semana_prueba,
  inicioOficial: gen.inicio_oficial,
  graduacion: gen.graduacion,
  ingresaronSemanaPrueba: gen.ingresaron_semana_prueba,
  permanentes: gen.permanentes,
  abandonaronPrueba: gen.abandonaron_prueba,
  completaronFrontend: gen.completaron_frontend,
  completaronBackend: gen.completaron_backend,
  graduadosFullStack: gen.graduados_fullstack,
  becasTotal: gen.becas_total,
  becasPuntarenas: gen.becas_puntarenas,
  becasDesamparados: gen.becas_desamparados,
  inicioInscripciones: gen.inicio_inscripciones,
  cierreInscripciones: gen.cierre_inscripciones,
  estado: gen.estado
});

const mapToSnake = (gen) => ({
  nombre: gen.nombre,
  periodo_prueba: gen.periodoPrueba,
  semana_prueba: gen.semanaPrueba,
  inicio_oficial: gen.inicioOficial,
  graduacion: gen.graduacion,
  ingresaron_semana_prueba: gen.ingresaronSemanaPrueba,
  permanentes: gen.permanentes,
  abandonaron_prueba: gen.abandonaronPrueba,
  completaron_frontend: gen.completaronFrontend,
  completaron_backend: gen.completaronBackend,
  graduados_fullstack: gen.graduadosFullStack,
  becas_total: gen.becasTotal,
  becas_puntarenas: gen.becasPuntarenas,
  becas_desamparados: gen.becasDesamparados,
  inicio_inscripciones: gen.inicioInscripciones,
  cierre_inscripciones: gen.cierreInscripciones,
  estado: gen.estado
});

const getGeneraciones = async (req, res) => {
  const { data, error } = await supabase.from('generaciones').select('*').order('id', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(mapToCamel));
};

const updateGeneracion = async (req, res) => {
  const { id } = req.params;
  const snakeData = mapToSnake(req.body);
  const { data, error } = await supabase.from('generaciones').update(snakeData).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(mapToCamel(data[0]));
};

module.exports = {
  getGeneraciones,
  updateGeneracion
};
