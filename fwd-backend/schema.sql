-- Crear la tabla de Contacto Inicial
CREATE TABLE contacto_inicial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT,
    provincia TEXT,
    movil TEXT,
    sede TEXT,
    estado TEXT DEFAULT 'Por contactar',
    fecha_contacto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar el acceso (Política simple para desarrollo)
ALTER TABLE contacto_inicial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo" ON contacto_inicial FOR ALL USING (true);
