const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fwd_secret_key_2026';

const register = async (req, res) => {
  const { email, password, nombre } = req.body;

  try {
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, nombre }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Crear Token
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
