require('dotenv').config();
const supabase = require('./src/config/supabase');
const fs = require('fs');
const path = require('path');

const migrate = async () => {
  console.log('🚀 Iniciando migración completa de datos...');
  
  try {
    const dbPath = path.join(__dirname, '..', 'fwd-dashboard', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // 1. Migrar Contactos (Ya lo hicimos, pero por si acaso hay nuevos)
    if (dbData.contactoInicial && dbData.contactoInicial.length > 0) {
      console.log(`Migrando ${dbData.contactoInicial.length} contactos...`);
      const payload = dbData.contactoInicial.map(({ id, fechaContacto, ...rest }) => ({
        ...rest,
        fecha_contacto: fechaContacto
      }));
      const { error } = await supabase.from('contacto_inicial').upsert(payload, { onConflict: 'nombre, apellido' });
      if (error) console.error('Error contactos:', error.message);
      else console.log('✅ Contactos migrados.');
    }

    // 2. Migrar Entrevistas
    if (dbData.entrevistas && dbData.entrevistas.length > 0) {
      console.log(`Migrando ${dbData.entrevistas.length} entrevistas...`);
      const { error } = await supabase.from('entrevistas').insert(dbData.entrevistas.map(({ id, ...rest }) => rest));
      if (error) console.error('Error entrevistas:', error.message);
      else console.log('✅ Entrevistas migradas.');
    }

    // 3. Migrar Fases
    if (dbData.fases && dbData.fases.length > 0) {
      console.log(`Migrando ${dbData.fases.length} fases...`);
      const { error } = await supabase.from('fases').insert(dbData.fases.map(({ id, ...rest }) => rest));
      if (error) console.error('Error fases:', error.message);
      else console.log('✅ Fases migradas.');
    }

    // 4. Migrar Campus Days
    if (dbData.campusDays && dbData.campusDays.length > 0) {
      console.log(`Migrando ${dbData.campusDays.length} campus days...`);
      const { error } = await supabase.from('campus_days').insert(dbData.campusDays.map(({ id, ...rest }) => rest));
      if (error) console.error('Error campus days:', error.message);
      else console.log('✅ Campus Days migrados.');
    }

    // 5. Migrar Generaciones
    if (dbData.generaciones && dbData.generaciones.length > 0) {
      console.log(`Migrando ${dbData.generaciones.length} generaciones...`);
      const { error } = await supabase.from('generaciones').insert(dbData.generaciones.map(({ id, ...rest }) => rest));
      if (error) console.error('Error generaciones:', error.message);
      else console.log('✅ Generaciones migradas.');
    }

    console.log('\n✨ Migración completada con éxito.');
  } catch (err) {
    console.error('❌ Error fatal:', err.message);
  }
};

migrate();
