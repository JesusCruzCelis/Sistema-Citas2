#!/usr/bin/env python3
"""
Script para ejecutar la migración de horarios de áreas
"""
import asyncio
import asyncpg
import os
from pathlib import Path

async def run_migration():
    # Obtener la URI de la base de datos desde las variables de entorno o usar valores por defecto
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_password = os.getenv("POSTGRES_PASSWORD", "123")
    db_host = os.getenv("POSTGRES_HOST", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB", "citas")
    
    database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    print("🔧 Conectando a la base de datos...")
    print(f"📍 Host: {db_host}:{db_port}")
    print(f"📊 Base de datos: {db_name}")
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(database_url)
        print("✅ Conexión exitosa")
        
        # Leer el archivo SQL
        migration_file = Path(__file__).parent / "migration_add_horarios_areas.sql"
        print(f"\n📄 Leyendo archivo de migración: {migration_file}")
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        # Ejecutar la migración
        print("\n🚀 Ejecutando migración...")
        await conn.execute(sql)
        print("✅ Migración ejecutada exitosamente")
        
        # Verificar que la tabla se creó
        result = await conn.fetchval(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'horarios_areas')"
        )
        
        if result:
            print("✅ Tabla 'horarios_areas' creada correctamente")
            
            # Obtener información de las columnas
            columns = await conn.fetch("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'horarios_areas'
                ORDER BY ordinal_position
            """)
            
            print("\n📋 Estructura de la tabla:")
            for col in columns:
                print(f"  • {col['column_name']}: {col['data_type']} {'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'}")
        else:
            print("❌ Error: La tabla no se pudo crear")
        
        # Cerrar conexión
        await conn.close()
        print("\n✅ Migración completada exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {str(e)}")
        raise

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 MIGRACIÓN: Agregar tabla de horarios de áreas")
    print("=" * 60)
    asyncio.run(run_migration())
