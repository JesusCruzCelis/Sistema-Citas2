-- ======================================
-- Script para BORRAR TODOS LOS VISITANTES
-- ======================================
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de visitantes, citas y carros
-- ⚠️ Esta acción NO se puede deshacer
-- ======================================

-- Desactivar las restricciones de claves foráneas temporalmente (si es necesario)
SET CONSTRAINTS ALL DEFERRED;

-- 1. Eliminar todas las citas primero (por las relaciones de clave foránea)
DELETE FROM citas;

-- 2. Eliminar todos los carros
DELETE FROM carros;

-- 3. Eliminar todos los visitantes
DELETE FROM visitantes;

-- Confirmar los cambios
COMMIT;

-- Verificar que todo se eliminó
SELECT 'Visitantes restantes: ' || COUNT(*) FROM visitantes;
SELECT 'Citas restantes: ' || COUNT(*) FROM citas;
SELECT 'Carros restantes: ' || COUNT(*) FROM carros;

-- ======================================
-- ✅ Script completado
-- ======================================
