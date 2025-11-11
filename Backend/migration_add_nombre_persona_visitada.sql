-- Migración para agregar campo de texto libre para persona visitada
-- Esto permite registrar cualquier nombre sin que esté en el sistema
-- Fecha: 11 de noviembre de 2025

-- Agregar la nueva columna de texto libre
ALTER TABLE citas 
ADD COLUMN "Nombre_Persona_Visitada" VARCHAR(255);

-- Agregar comentario a la columna
COMMENT ON COLUMN citas."Nombre_Persona_Visitada" IS 'Nombre completo de la persona a visitar (texto libre). NO requiere estar registrada en el sistema. Es opcional.';

-- Verificar el cambio
-- Para ejecutar esta verificación manualmente después de la migración:
-- SELECT column_name, is_nullable, data_type, character_maximum_length
-- FROM information_schema.columns 
-- WHERE table_name = 'citas' AND column_name = 'Nombre_Persona_Visitada';
