require('dotenv').config();
const supabase = require('./src/config/supabase');

const campusDays = [
  { id: 1, fecha: new Date('2026-04-17'), sede: 'Puntarenas' },
  { id: 2, fecha: new Date('2026-04-21'), sede: 'Desamparados' },
  { id: 3, fecha: new Date('2026-05-08'), sede: 'Puntarenas' },
  { id: 4, fecha: new Date('2026-05-12'), sede: 'Desamparados' },
  { id: 5, fecha: new Date('2026-05-22'), sede: 'Puntarenas' },
  { id: 6, fecha: new Date('2026-06-05'), sede: 'Puntarenas' }
];

async function fixAssignments() {
  console.log('⏳ Iniciando reasignación inteligente de Campus Days...');
  
  const { data: contactos, error } = await supabase.from('contacto_inicial').select('*');
  if (error) {
    console.error('Error al obtener contactos:', error);
    return;
  }

  console.log(`Analizando ${contactos.length} contactos...`);

  for (const contacto of contactos) {
    // Intentar parsear la fecha de contacto (formato dd/mm/yyyy o similar)
    let fechaC;
    if (contacto.fecha_contacto) {
        const parts = contacto.fecha_contacto.split('/');
        if (parts.length === 3) {
            fechaC = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
            fechaC = new Date(contacto.fecha_contacto);
        }
    } else {
        fechaC = new Date(contacto.created_at);
    }

    if (isNaN(fechaC.getTime())) {
        fechaC = new Date(contacto.created_at);
    }

    // Filtrar eventos de la misma sede
    const sedeKeyword = (contacto.sede || '').toLowerCase().includes('puntarenas') ? 'Puntarenas' : 'Desamparados';
    const eventosSede = campusDays.filter(d => d.sede === sedeKeyword);

    // Encontrar el primer evento que sea DESPUÉS de la fecha de contacto
    let asignado = eventosSede.find(e => e.fecha >= fechaC);
    
    // Si no hay ninguno después (ej. entró después del último), asignamos el último disponible
    if (!asignado && eventosSede.length > 0) {
        asignado = eventosSede[eventosSede.length - 1];
    }

    if (asignado) {
      await supabase
        .from('contacto_inicial')
        .update({ campus_day_id: asignado.id })
        .eq('id', contacto.id);
    }
  }

  console.log('✅ Reasignación completada.');
}

fixAssignments();
