const supabase = require('../config/supabase');

const getContactos = async (req, res) => {
  const { data, error } = await supabase
    .from('contacto_inicial')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  
  // Mapear de vuelta a camelCase para el frontend
  const mappedData = data.map(({ fecha_contacto, ...rest }) => ({
    ...rest,
    fechaContacto: fecha_contacto
  }));
  
  res.json(mappedData);
};

const createContacto = async (req, res) => {
  const { fechaContacto, ...rest } = req.body;
  let campus_day_id = req.body.campus_day_id;

  try {
    // Si no viene asignado, buscamos el próximo evento para esa sede
    if (!campus_day_id && rest.sede) {
      const { data: events } = await supabase
        .from('campus_days')
        .select('id, fecha')
        .ilike('sede', `%${rest.sede.split(' ')[0]}%`) // Busca "Puntarenas" o "Desamparados"
        .order('id', { ascending: true });

      if (events && events.length > 0) {
        // Por ahora asignamos el primer evento pendiente o el más próximo
        // (En un sistema real compararíamos fechas, pero aquí usaremos el ID como secuencia)
        // Buscamos el primero que no esté realizado si existiera esa info, 
        // o simplemente el más bajo de los disponibles para esa sede
        campus_day_id = events[0].id;
      }
    }

    const payload = { 
      ...rest, 
      fecha_contacto: fechaContacto,
      campus_day_id: campus_day_id 
    };

    const { data, error } = await supabase
      .from('contacto_inicial')
      .insert([payload])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    
    const result = { ...data[0], fechaContacto: data[0].fecha_contacto };
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateContacto = async (req, res) => {
  const { id } = req.params;
  const { fechaContacto, ...rest } = req.body;
  const payload = { ...rest, fecha_contacto: fechaContacto };

  try {
    // 1. Obtener el estado actual antes de actualizar para el historial
    const { data: oldData } = await supabase
      .from('contacto_inicial')
      .select('estado')
      .eq('id', id)
      .single();

    // 2. Actualizar el contacto
    const { data, error } = await supabase
      .from('contacto_inicial')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    // 3. Si el estado cambió, guardar en el historial
    if (oldData && oldData.estado !== payload.estado) {
      await supabase.from('historial_contactos').insert([{
        contacto_id: id,
        estado_anterior: oldData.estado,
        estado_nuevo: payload.estado,
        usuario_cambio: req.user ? req.user.email : 'Sistema'
      }]);
    }

    const result = { ...data[0], fechaContacto: data[0].fecha_contacto };
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHistorial = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('historial_contactos')
    .select('*')
    .eq('contacto_id', id)
    .order('fecha_cambio', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

const deleteContacto = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('contacto_inicial')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Contacto eliminado correctamente' });
};

module.exports = {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
  getHistorial
};
