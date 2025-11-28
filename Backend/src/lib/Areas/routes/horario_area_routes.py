from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from uuid import UUID

from ..schemas.horario_area_schema import (
    HorarioAreaCreate,
    HorarioAreaUpdate,
    HorarioAreaResponse
)
from ..services.horario_area_servicios import HorarioAreaServicios
from ...auth.auth import verify_access_token

horario_area_routes = APIRouter(prefix='/horarios-areas', tags=['Horarios de Áreas'])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = verify_access_token(token)
        return payload
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Requiere que el usuario sea admin_sistema o admin_escuela"""
    if current_user.get("rol") not in ["admin_sistema", "admin_escuela"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a este recurso. Se requiere rol de administrador."
        )
    return current_user

async def require_any_role(current_user: dict = Depends(get_current_user)) -> dict:
    """Permite acceso a cualquier usuario autenticado"""
    return current_user


@horario_area_routes.post('/add', status_code=status.HTTP_201_CREATED, response_model=HorarioAreaResponse)
async def create_horario_area(
    horario_data: HorarioAreaCreate,
    current_user: dict = Depends(require_admin)
):
    """Crear un nuevo horario para un área (solo administradores)"""
    service = HorarioAreaServicios()
    try:
        horario = await service.create_horario(
            area=horario_data.Area,
            dia_semana=horario_data.Dia_Semana,
            hora_inicio=horario_data.Hora_Inicio,
            hora_fin=horario_data.Hora_Fin,
            tipo=horario_data.Tipo,
            descripcion=horario_data.Descripcion
        )
        return horario
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@horario_area_routes.get('/area/{area}', status_code=status.HTTP_200_OK, response_model=List[HorarioAreaResponse])
async def get_horarios_by_area(
    area: str,
    current_user: dict = Depends(require_any_role)
):
    """Obtener todos los horarios de un área específica"""
    service = HorarioAreaServicios()
    horarios = await service.get_horarios_by_area(area)
    return horarios


@horario_area_routes.get('/all', status_code=status.HTTP_200_OK, response_model=List[HorarioAreaResponse])
async def get_all_horarios(
    current_user: dict = Depends(require_any_role)
):
    """Obtener todos los horarios de todas las áreas"""
    service = HorarioAreaServicios()
    horarios = await service.get_all_horarios()
    return horarios


@horario_area_routes.get('/{horario_id}', status_code=status.HTTP_200_OK, response_model=HorarioAreaResponse)
async def get_horario_by_id(
    horario_id: UUID,
    current_user: dict = Depends(require_any_role)
):
    """Obtener un horario específico por su ID"""
    service = HorarioAreaServicios()
    horario = await service.get_horario_by_id(horario_id)
    
    if not horario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el horario con ID {horario_id}"
        )
    
    return horario


@horario_area_routes.put('/{horario_id}', status_code=status.HTTP_200_OK, response_model=HorarioAreaResponse)
async def update_horario_area(
    horario_id: UUID,
    horario_data: HorarioAreaUpdate,
    current_user: dict = Depends(require_admin)
):
    """Actualizar un horario existente (solo administradores)"""
    service = HorarioAreaServicios()
    
    horario = await service.update_horario(
        horario_id=horario_id,
        area=horario_data.Area,
        dia_semana=horario_data.Dia_Semana,
        hora_inicio=horario_data.Hora_Inicio,
        hora_fin=horario_data.Hora_Fin,
        tipo=horario_data.Tipo,
        descripcion=horario_data.Descripcion
    )
    
    if not horario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el horario con ID {horario_id}"
        )
    
    return horario


@horario_area_routes.delete('/{horario_id}', status_code=status.HTTP_200_OK)
async def delete_horario_area(
    horario_id: UUID,
    current_user: dict = Depends(require_admin)
):
    """Eliminar un horario (solo administradores)"""
    service = HorarioAreaServicios()
    
    success = await service.delete_horario(horario_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el horario con ID {horario_id}"
        )
    
    return {"message": "Horario eliminado correctamente"}


@horario_area_routes.delete('/area/{area}', status_code=status.HTTP_200_OK)
async def delete_horarios_by_area(
    area: str,
    current_user: dict = Depends(require_admin)
):
    """Eliminar todos los horarios de un área (solo administradores)"""
    service = HorarioAreaServicios()
    
    count = await service.delete_horarios_by_area(area)
    
    if count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontraron horarios para el área '{area}'"
        )
    
    return {"message": f"Se eliminaron {count} horario(s) del área '{area}'"}
