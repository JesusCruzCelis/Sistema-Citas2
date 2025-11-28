from src.lib.auth.auth_routes import auth_routes
from src.lib.Usuarios.routes.usuario_routes import usuarios_routes
from src.lib.Areas.routes.horario_area_routes import horario_area_routes
from src.database.database_config import engine,Base
from src.lib.Visitantes.models.visitantes_orm import VisitanteORM
from src.lib.Usuarios.models.usuarios_orm import UsuarioORM
from src.lib.Carros.models.carro_orm import CarroORM
from src.lib.Citas.models.citas_orm import CitasORM
from src.lib.Areas.models.horario_area_orm import HorarioAreaORM
from src.lib.Usuarios.services.usuarios_servicios import UsuarioServicios
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Configurar CORS ANTES de los routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_routes)
app.include_router(auth_routes)
app.include_router(horario_area_routes)


# Task para actualizar estados de citas automáticamente
async def actualizar_estados_periodicamente():
    """Actualiza los estados de las citas cada 5 minutos"""
    service = UsuarioServicios()
    while True:
        try:
            await service.actualizar_estados_citas()
        except Exception as e:
            print(f"Error actualizando estados: {e}")
        # Esperar 5 minutos antes de la próxima actualización
        await asyncio.sleep(300)  # 300 segundos = 5 minutos


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Tablas creadas")
    
    # Iniciar tarea de actualización automática de estados
    asyncio.create_task(actualizar_estados_periodicamente())
    print("✅ Scheduler de actualización de estados iniciado")