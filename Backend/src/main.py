from src.lib.auth.auth_routes import auth_routes
from src.lib.Usuarios.routes.usuario_routes import usuarios_routes
from src.database.database_config import engine,Base
from src.lib.Visitantes.models.visitantes_orm import VisitanteORM
from src.lib.Usuarios.models.usuarios_orm import UsuarioORM
from src.lib.Carros.models.carro_orm import CarroORM
from src.lib.Citas.models.citas_orm import CitasORM
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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



@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Tablas creadas")