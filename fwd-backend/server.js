require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./src/config/supabase');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de FWD Dashboard corriendo...');
});

// Importar Rutas
const authRoutes = require('./src/routes/authRoutes');
const contactoRoutes = require('./src/routes/contactoRoutes');
const entrevistasRoutes = require('./src/routes/entrevistasRoutes');
const academicaRoutes = require('./src/routes/academicaRoutes');

// Importar Middleware de Protección
const authMiddleware = require('./src/middleware/authMiddleware');

// Rutas Públicas
app.use('/api/auth', authRoutes);

// Rutas Protegidas (Requieren Login)
app.use('/api/contactos', authMiddleware, contactoRoutes);
app.use('/api/entrevistas', authMiddleware, entrevistasRoutes);
app.use('/api/academica', authMiddleware, academicaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
