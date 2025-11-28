-- Crear tabla de horarios de áreas
CREATE TABLE IF NOT EXISTS horarios_areas (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Area" VARCHAR NOT NULL,
    "Dia_Semana" INTEGER NOT NULL CHECK ("Dia_Semana" >= 0 AND "Dia_Semana" <= 6),
    "Hora_Inicio" TIME NOT NULL,
    "Hora_Fin" TIME NOT NULL,
    "Tipo" VARCHAR NOT NULL DEFAULT 'libre' CHECK ("Tipo" IN ('libre', 'ocupado')),
    "Descripcion" VARCHAR,
    CONSTRAINT check_horario_valido CHECK ("Hora_Fin" > "Hora_Inicio")
);

-- Crear índice para mejorar el rendimiento de las consultas por área
CREATE INDEX IF NOT EXISTS idx_horarios_areas_area ON horarios_areas("Area");

-- Crear índice compuesto para mejorar consultas por área y día
CREATE INDEX IF NOT EXISTS idx_horarios_areas_area_dia ON horarios_areas("Area", "Dia_Semana");

-- Comentarios
COMMENT ON TABLE horarios_areas IS 'Tabla de horarios de atención para cada área de la universidad';
COMMENT ON COLUMN horarios_areas."Area" IS 'Nombre del área (ej: Biblioteca, Cafetería, etc.)';
COMMENT ON COLUMN horarios_areas."Dia_Semana" IS 'Día de la semana (0=Lunes, 1=Martes, ..., 6=Domingo)';
COMMENT ON COLUMN horarios_areas."Hora_Inicio" IS 'Hora de inicio del horario';
COMMENT ON COLUMN horarios_areas."Hora_Fin" IS 'Hora de fin del horario';
COMMENT ON COLUMN horarios_areas."Tipo" IS 'Tipo de horario: libre u ocupado';
COMMENT ON COLUMN horarios_areas."Descripcion" IS 'Descripción opcional del horario';
