-- Agregar columnas faltantes a generaciones
ALTER TABLE generaciones 
ADD COLUMN estado TEXT,
ADD COLUMN "becasTotal" INTEGER,
ADD COLUMN "becasPuntarenas" INTEGER,
ADD COLUMN "becasDesamparados" INTEGER,
ADD COLUMN "inicioInscripciones" TEXT,
ADD COLUMN "cierreInscripciones" TEXT;

-- Asegurar que campus_days tiene pasaronAEntrevista bien escrito
-- (Ya lo incluí antes, pero por si acaso)
