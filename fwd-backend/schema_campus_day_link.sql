-- Añadir columna para vincular contactos con un Campus Day específico
ALTER TABLE contacto_inicial 
ADD COLUMN campus_day_id INTEGER REFERENCES campus_days(id);

-- Crear un índice para mejorar la velocidad de filtrado por evento
CREATE INDEX idx_contacto_campus_day ON contacto_inicial(campus_day_id);
