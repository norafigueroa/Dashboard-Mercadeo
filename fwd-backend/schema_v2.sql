-- Tabla Entrevistas
CREATE TABLE entrevistas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT,
    apellido TEXT,
    sede TEXT,
    "comoSeEntero" TEXT,
    estado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Fases
CREATE TABLE fases (
    id SERIAL PRIMARY KEY,
    fase INTEGER,
    semana INTEGER,
    periodo TEXT,
    meta INTEGER,
    acumulado INTEGER
);

-- Tabla Campus Days
CREATE TABLE campus_days (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    fecha TEXT,
    sede TEXT,
    estado TEXT,
    asistentes INTEGER,
    "pasaronAEntrevista" INTEGER
);

-- Tabla Generaciones
CREATE TABLE generaciones (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    "periodoPrueba" TEXT,
    "semanaPrueba" TEXT,
    "inicioOficial" TEXT,
    graduacion TEXT,
    "ingresaronSemanaPrueba" INTEGER,
    permanentes INTEGER,
    "abandonaronPrueba" INTEGER,
    "completaronFrontend" INTEGER,
    "completaronBackend" INTEGER,
    "graduadosFullStack" INTEGER
);

-- Habilitar RLS para todas
ALTER TABLE entrevistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fases ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE generaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo entrevistas" ON entrevistas FOR ALL USING (true);
CREATE POLICY "Permitir todo fases" ON fases FOR ALL USING (true);
CREATE POLICY "Permitir todo campus_days" ON campus_days FOR ALL USING (true);
CREATE POLICY "Permitir todo generaciones" ON generaciones FOR ALL USING (true);
