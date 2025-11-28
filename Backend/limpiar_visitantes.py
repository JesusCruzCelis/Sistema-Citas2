#!/usr/bin/env python3
"""
Script para limpiar todos los visitantes, citas y carros de la base de datos
⚠️ ADVERTENCIA: Esta acción NO se puede deshacer
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Configuración de la base de datos
DATABASE_URL = "postgresql+asyncpg://root:root@localhost/ulsa"

async def limpiar_base_datos():
    """Limpia todos los visitantes, citas y carros de la base de datos"""
    
    # Crear engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    print("\n" + "="*60)
    print("⚠️  ADVERTENCIA: Estás a punto de BORRAR TODOS los datos")
    print("="*60)
    print("Se eliminarán:")
    print("  • Todas las citas")
    print("  • Todos los carros")
    print("  • Todos los visitantes")
    print("\n⚠️  Esta acción NO se puede deshacer\n")
    
    confirmacion = input("¿Estás seguro? Escribe 'BORRAR TODO' para confirmar: ")
    
    if confirmacion != "BORRAR TODO":
        print("\n❌ Operación cancelada")
        return
    
    print("\n🗑️  Iniciando limpieza de la base de datos...\n")
    
    async with async_session() as session:
        try:
            # Contar registros antes de eliminar
            result = await session.execute(text("SELECT COUNT(*) FROM citas"))
            citas_count = result.scalar()
            
            result = await session.execute(text("SELECT COUNT(*) FROM carros"))
            carros_count = result.scalar()
            
            result = await session.execute(text("SELECT COUNT(*) FROM visitantes"))
            visitantes_count = result.scalar()
            
            print(f"📊 Registros actuales:")
            print(f"   • Citas: {citas_count}")
            print(f"   • Carros: {carros_count}")
            print(f"   • Visitantes: {visitantes_count}")
            print()
            
            # Eliminar en orden correcto
            print("🗑️  Eliminando citas...")
            await session.execute(text("DELETE FROM citas"))
            
            print("🗑️  Eliminando carros...")
            await session.execute(text("DELETE FROM carros"))
            
            print("🗑️  Eliminando visitantes...")
            await session.execute(text("DELETE FROM visitantes"))
            
            # Confirmar cambios
            await session.commit()
            
            # Verificar que se eliminaron
            result = await session.execute(text("SELECT COUNT(*) FROM citas"))
            citas_restantes = result.scalar()
            
            result = await session.execute(text("SELECT COUNT(*) FROM carros"))
            carros_restantes = result.scalar()
            
            result = await session.execute(text("SELECT COUNT(*) FROM visitantes"))
            visitantes_restantes = result.scalar()
            
            print("\n✅ Limpieza completada exitosamente!")
            print(f"\n📊 Registros después de la limpieza:")
            print(f"   • Citas: {citas_restantes}")
            print(f"   • Carros: {carros_restantes}")
            print(f"   • Visitantes: {visitantes_restantes}")
            
        except Exception as e:
            print(f"\n❌ Error al limpiar la base de datos: {str(e)}")
            await session.rollback()
            sys.exit(1)
    
    await engine.dispose()
    print("\n✅ Proceso completado\n")

if __name__ == "__main__":
    asyncio.run(limpiar_base_datos())
