#!/usr/bin/env python3
"""
Script para ejecutar la migración de horarios de coordinadores
"""
import asyncio
import asyncpg
from pathlib import Path

async def ejecutar_migracion():
    # Credenciales de la base de datos
    conn = await asyncpg.connect(
        user='barrita',
        password='12345',
        database='SistemaPrueba',
        host='127.0.0.1',
        port=5432
    )
    
    try:
        # Leer el archivo de migración
        migration_file = Path(__file__).parent / 'migration_add_horarios_coordinadores.sql'
        sql_content = migration_file.read_text()
        
        print("🔄 Ejecutando migración...")
        
        # Ejecutar el SQL
        await conn.execute(sql_content)
        
        print("✅ Migración ejecutada exitosamente!")
        print("✅ Tabla 'horarios_coordinadores' creada correctamente")
        
        # Verificar que la tabla se creó
        result = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'horarios_coordinadores'
            )
        """)
        
        if result:
            print("✅ Tabla verificada en la base de datos")
        else:
            print("❌ Error: La tabla no se encontró después de la migración")
            
    except Exception as e:
        print(f"❌ Error al ejecutar la migración: {e}")
        raise
    finally:
        await conn.close()
        print("\n🎉 Proceso completado!")

if __name__ == "__main__":
    asyncio.run(ejecutar_migracion())
