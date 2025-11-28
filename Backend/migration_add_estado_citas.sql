-- Migración: Agregar campo Estado a la tabla citas
-- Fecha: 2025-11-28
-- Descripción: Agrega el campo Estado con valores: activa, completada, cancelada

-- Agregar la columna Estado con valor por defecto 'activa'
ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS "Estado" VARCHAR(20) DEFAULT 'activa';

-- Agregar constraint para validar solo valores permitidos
ALTER TABLE citas
ADD CONSTRAINT check_estado_valido 
CHECK ("Estado" IN ('activa', 'completada', 'cancelada'));

-- Crear índice para mejorar búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas("Estado");

-- Actualizar citas existentes basándose en la fecha y hora
-- Las citas pasadas se marcan como completadas
UPDATE citas
SET "Estado" = 'completada'
WHERE CONCAT("Fecha", ' ', "Hora")::timestamp < NOW()
  AND "Estado" = 'activa';

-- Comentarios para documentación
COMMENT ON COLUMN citas."Estado" IS 'Estado de la cita: activa, completada, cancelada';

-- Mostrar resultados
SELECT 'Migración completada exitosamente' AS mensaje;
