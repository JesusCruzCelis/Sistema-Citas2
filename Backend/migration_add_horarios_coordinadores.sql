-- Migración para crear la tabla de horarios de coordinadores
-- Fecha: 2025-11-28
-- Descripción: Permite asignar horarios personalizados a los coordinadores (admin_escuela)

CREATE TABLE IF NOT EXISTS horarios_coordinadores (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Usuario_Id" UUID NOT NULL,
    "Dia_Semana" INTEGER NOT NULL CHECK ("Dia_Semana" >= 0 AND "Dia_Semana" <= 6),
    "Hora_Inicio" TIME NOT NULL,
    "Hora_Fin" TIME NOT NULL,
    "Tipo" VARCHAR(20) NOT NULL DEFAULT 'libre' CHECK ("Tipo" IN ('libre', 'ocupado')),
    "Descripcion" VARCHAR(100),
    CONSTRAINT fk_usuario_horario FOREIGN KEY ("Usuario_Id") 
        REFERENCES usuarios("Id") ON DELETE CASCADE,
    CONSTRAINT check_hora_valida CHECK ("Hora_Fin" > "Hora_Inicio")
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_horarios_usuario ON horarios_coordinadores("Usuario_Id");
CREATE INDEX IF NOT EXISTS idx_horarios_dia ON horarios_coordinadores("Dia_Semana");
CREATE INDEX IF NOT EXISTS idx_horarios_tipo ON horarios_coordinadores("Tipo");

-- Comentarios para documentación
COMMENT ON TABLE horarios_coordinadores IS 'Horarios semanales de disponibilidad de los coordinadores';
COMMENT ON COLUMN horarios_coordinadores."Dia_Semana" IS 'Día de la semana: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo';
COMMENT ON COLUMN horarios_coordinadores."Tipo" IS 'Tipo de bloque: libre (disponible para citas) u ocupado (clase u otra actividad)';
