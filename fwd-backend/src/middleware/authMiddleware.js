const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fwd_secret_key_2026';

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'No hay token, acceso denegado' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token no válido' });
  }
};
