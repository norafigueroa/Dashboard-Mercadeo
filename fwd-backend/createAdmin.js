require('dotenv').config();
const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  const email = 'admin@fwd.com';
  const password = 'fwd-dashboard-2026';
  const nombre = 'Administrador FWD';

  console.log(`Intentando crear usuario: ${email}...`);

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, nombre }])
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️ El usuario ya existe.');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Usuario administrador creado con éxito.');
    }
  } catch (err) {
    console.error('❌ Error al crear usuario:', err.message);
  }
};

createAdmin();
