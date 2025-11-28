#!/usr/bin/env python3
"""
Script para ejecutar la migración que agrega el campo Estado a las citas
"""
import asyncio
import asyncpg
import os
from pathlib import Path

async def run_migration():
    # Obtener la URI de la base de datos desde las variables de entorno o usar valores por defecto
    db_user = os.getenv("POSTGRES_USER", "barrita")
    db_password = os.getenv("POSTGRES_PASSWORD", "12345")
    db_host = os.getenv("POSTGRES_HOST", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB", "SistemaPrueba")
    
    database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    print("=" * 60)
    print("🔧 MIGRACIÓN: Agregar campo Estado a citas")
    print("=" * 60)
    print("🔧 Conectando a la base de datos...")
    print(f"📍 Host: {db_host}:{db_port}")
    print(f"📊 Base de datos: {db_name}")
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(database_url)
        print("✅ Conexión exitosa\n")
        
        # Leer el archivo SQL
        migration_file = Path(__file__).parent / "migration_add_estado_citas.sql"
        print(f"📄 Leyendo archivo de migración: {migration_file}")
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Ejecutar la migración
        print("🚀 Ejecutando migración...")
        await conn.execute(sql_content)
        print("✅ Migración ejecutada exitosamente")
        
        # Verificar que la columna se agregó correctamente
        result = await conn.fetch("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'citas' AND column_name = 'Estado';
        """)
        
        if result:
            print("✅ Columna 'Estado' agregada correctamente")
            print(f"   • Tipo de dato: {result[0]['data_type']}")
            print(f"   • Valor por defecto: {result[0]['column_default']}")
        
        # Mostrar estadísticas de citas por estado
        stats = await conn.fetch("""
            SELECT "Estado", COUNT(*) as total
            FROM citas
            GROUP BY "Estado"
            ORDER BY "Estado";
        """)
        
        if stats:
            print("\n📊 Estadísticas de citas por estado:")
            for row in stats:
                print(f"   • {row['estado']}: {row['total']} citas")
        
        print("\n✅ Migración completada exitosamente")
        
        await conn.close()
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(run_migration())
