-- Migración para hacer el campo Usuario_Visitado opcional en la tabla citas
-- Esto permite registrar citas donde el visitante solo visita un área sin una persona específica
-- Fecha: 11 de noviembre de 2025

-- Nota: Esta migración es para PostgreSQL
-- Si usas otro motor de base de datos, ajusta la sintaxis según corresponda

-- Modificar la columna Usuario_Visitado para permitir valores NULL
ALTER TABLE citas 
ALTER COLUMN "Usuario_Visitado" DROP NOT NULL;

-- Agregar comentario a la columna para documentar el cambio (opcional)
COMMENT ON COLUMN citas."Usuario_Visitado" IS 'ID del usuario del sistema que será visitado. OPCIONAL: Si es NULL, la visita es solo al área especificada sin una persona en particular.';

-- Verificar el cambio
-- Para ejecutar esta verificación manualmente después de la migración:
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'citas' AND column_name = 'Usuario_Visitado';
