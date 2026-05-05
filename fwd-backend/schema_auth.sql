-- Tabla de Usuarios
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT,
    rol TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Seguridad de filas)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura propia" ON usuarios FOR SELECT USING (true);
