from fastapi.exceptions import HTTPException
from fastapi import APIRouter, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import date, time
from uuid import UUID
from ..services.usuarios_servicios import UsuarioServicios
from ..schemas.usuario_schema import UsuarioResponse, UsuarioRequestCreate, UsuarioRequestUpdate, UsuarioSearchByName, UsuarioResponseDetail
from ..schemas.horario_coordinador_schema import (
    HorarioCoordinadorCreate, 
    HorarioCoordinadorResponse, 
    HorarioCoordinadorUpdate
)
from ...Citas.schemas.citas_schema import CitasRequestCreate, CitasResponse, CitasResponseDetail, CitaResponseAdmin
from ...Carros.schemas.carro_schema import CarroRequestCreate
from ...Visitantes.schemas.visitantes_schemas import VisitanteRequestCreate
from ...auth.auth import verify_access_token
from ...Usuarios.services.email_servicios import EmailService

usuarios_routes = APIRouter(prefix='/universidad', tags=['universidad'])
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


async def require_role(required_roles: List[str], current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("rol")
    if user_role not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso denegado. Se requiere rol: {', '.join(required_roles)}"
        )
    return current_user


async def require_root(current_user: dict = Depends(get_current_user)):
    return await require_role(["admin_sistema"], current_user)


async def require_root_or_admin(current_user: dict = Depends(get_current_user)):
    return await require_role(["admin_sistema", "admin_escuela"], current_user)


async def require_any_role(current_user: dict = Depends(get_current_user)):
    return await require_role(["admin_sistema", "admin_escuela", "usuario", "vigilancia"], current_user)


@usuarios_routes.get('/usuarios', status_code=status.HTTP_200_OK, response_model=List[UsuarioResponseDetail])
async def get_usuarios(current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        usuarios = await service.get_user()
        return usuarios
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.post('/usuarios/add', status_code=status.HTTP_201_CREATED)
async def create_user(usuario_data: UsuarioRequestCreate,current_user: dict = Depends(require_root)):
    service = UsuarioServicios()
    try:
        await service.create_user(
            nombre=usuario_data.Nombre,
            apellido_paterno=usuario_data.Apellido_Paterno,
            apellido_materno=usuario_data.Apellido_Materno,
            password=usuario_data.Password,
            email=usuario_data.Email,
            rol=usuario_data.Rol,
            rol_escuela=usuario_data.Rol_Escuela,
            area=usuario_data.Area
        )
        return {"message": "Usuario creado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@usuarios_routes.patch('/usuarios/modify/{id}')
async def update_user(id: UUID, usuario_data: UsuarioRequestUpdate, current_user: dict = Depends(require_root)):
    service = UsuarioServicios()
    try:
        await service.update_user_by_id(
            id=id,
            nombre=usuario_data.Nombre,
            apellido_paterno=usuario_data.Apellido_Paterno,
            apellido_materno=usuario_data.Apellido_Materno,
            password=usuario_data.Password,
            email=usuario_data.Email,
            rol=usuario_data.Rol,
            rol_escuela=usuario_data.Rol_Escuela,
            area=usuario_data.Area
        )
        return {"message": "Usuario actualizado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.delete('/usuarios/delete/{id}', status_code=status.HTTP_200_OK)
async def delete_user(id: UUID, current_user: dict = Depends(require_root)):
    service = UsuarioServicios()
    try:
        await service.delete_user_by_id(id)
        return {"message": "Usuario eliminado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/usuarios/search/name', response_model=List[UsuarioResponse], status_code=status.HTTP_200_OK)
async def get_user_by_name(nombre: str, apellido_paterno: str, apellido_materno: str, current_user: dict = Depends(require_root)):
    service = UsuarioServicios()
    try:
        usuario = await service.get_usuario_by_nombre(
            nombre=nombre,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno
        )
        return usuario
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/usuarios/search/rol', response_model=List[UsuarioResponse])
async def get_user_by_rol(rol: str, current_user: dict = Depends(require_root)):
    service = UsuarioServicios()
    try:
        usuario = await service.get_user_by_rol(rol)
        return usuario
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/usuarios/search/id/{id}', response_model=UsuarioResponseDetail)
async def get_user_by_id(id: UUID, current_user: dict = Depends(require_root)):
    service = UsuarioServicios()
    try:
        usuario = await service.get_user_by_id_detail(id)
        return usuario
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/usuarios/search/area', response_model=List[UsuarioResponse])
async def get_usuario_by_area(area: str, current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        usuarios = await service.get_user_by_area(area)
        return usuarios
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.post('/citas/add', status_code=status.HTTP_201_CREATED)
async def create_cita(cita_data: CitasRequestCreate, current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        await service.create_cita(
            nombre_persona_visitada=cita_data.Nombre_Persona_Visitada,
            usuario_visitado=cita_data.Usuario_Visitado,
            nombre_visitante=cita_data.Nombre_Visitante,
            apellido_paterno_visitante=cita_data.Apellido_Paterno_Visitante,
            apellido_materno_visitante=cita_data.Apellido_Materno_Visitante,
            placas=cita_data.Placas,
            fecha=cita_data.Fecha,
            hora=cita_data.Hora,
            area=cita_data.Area,
            creado_por=UUID(current_user.get("sub"))
        )
        return {"message": "Cita creada exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/citas', status_code=status.HTTP_200_OK, response_model=List[CitaResponseAdmin])
async def get_citas(current_user: dict = Depends(require_any_role)):
    service = UsuarioServicios()
    try:
        usuario_id = UUID(current_user.get("sub"))
        rol = current_user.get("rol")
        citas = await service.get_citas(usuario_id=usuario_id, rol=rol)
        return citas
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.patch('/citas/modify/{id}', status_code=status.HTTP_200_OK)
async def update_cita(id: UUID, fecha: date = None, hora: time = None, current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        usuario_id = UUID(current_user.get("sub"))
        rol = current_user.get("rol")
        
        await service.update_cita_by_id(
            id=id,
            fecha=fecha,
            hora=hora,
            usuario_id=usuario_id,
            rol=rol
        )
        return {"message": "Cita actualizada exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise


@usuarios_routes.delete('/citas/delete', status_code=status.HTTP_200_OK)
async def delete_cita(id: UUID, current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        usuario_id = UUID(current_user.get("sub"))
        rol = current_user.get("rol")
        
        await service.delete_cita_by_id(id, usuario_id=usuario_id, rol=rol)
        return {"message": "Cita eliminada exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise


@usuarios_routes.get('/citas/detail/{id}', status_code=status.HTTP_200_OK, response_model=CitasResponseDetail)
async def get_cita_detail(id: UUID, current_user: dict = Depends(require_any_role)):
    service = UsuarioServicios()
    try:
        cita = await service.get_cita_detail(id)
        return cita
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/citas/visitante', status_code=status.HTTP_200_OK, response_model=CitasResponse)
async def get_cita_by_visitante(visitante_data: UsuarioSearchByName, current_user: dict = Depends(require_any_role)):
    service = UsuarioServicios()
    try:
        cita = await service.get_cita_by_visitante(
            nombre=visitante_data.Nombre,
            apellido_paterno=visitante_data.Apellido_Paterno,
            apellido_materno=visitante_data.Apellido_Materno
        )
        return cita
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/citas/usuarios', status_code=status.HTTP_200_OK, response_model=list[CitasResponse])
async def get_cita_by_visitado(usuario_data: UsuarioSearchByName, current_user: dict = Depends(require_any_role)):
    service = UsuarioServicios()
    try:
        cita = await service.get_citas_by_usuario_visitado(
            nombre=usuario_data.Nombre,
            apellido_paterno=usuario_data.Apellido_Paterno,
            apellido_materno=usuario_data.Apellido_Materno
        )
        return cita
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/citas/fecha', status_code=status.HTTP_200_OK, response_model=List[CitasResponse])
async def get_cita_by_fecha(fecha: date, current_user: dict = Depends(require_any_role)):
    service = UsuarioServicios()
    try:
        cita = await service.get_cita_by_fecha(fecha)
        return cita
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/citas/horas-ocupadas/{fecha}', status_code=status.HTTP_200_OK)
async def get_horas_ocupadas(
    fecha: date, 
    area: Optional[str] = None,
    persona_visitada_id: Optional[UUID] = None,
    current_user: dict = Depends(require_any_role)
):
    """
    Retorna una lista de horas ocupadas para una fecha específica.
    Considera que cada cita dura 30 minutos, por lo que bloquea 30 minutos antes y después.
    
    Filtros opcionales:
    - area: Filtra solo citas del área especificada
    - persona_visitada_id: Filtra solo citas con la persona visitada específica
    """
    service = UsuarioServicios()
    try:
        citas = await service.get_cita_by_fecha(fecha)
        if not citas:
            return {"horas_ocupadas": []}
        
        # Filtrar por área si se especifica
        if area:
            citas = [c for c in citas if c.Area == area]
        
        # Filtrar por persona visitada si se especifica
        if persona_visitada_id:
            citas = [c for c in citas if c.Usuario_Visitado == persona_visitada_id]
        
        # Crear lista de horarios ocupados (formato HH:MM)
        horas_ocupadas = []
        for cita in citas:
            hora_str = cita.Hora.strftime('%H:%M')
            horas_ocupadas.append(hora_str)
        
        return {"horas_ocupadas": horas_ocupadas}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.post('/carro/add', status_code=status.HTTP_201_CREATED)
async def create_car(car_data: CarroRequestCreate, current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        await service.create_car(
            marca=car_data.Marca,
            modelo=car_data.Modelo,
            color=car_data.Color,
            placas=car_data.Placas
        )
        return {"message": "Carro creado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.post('/visitante/add')
async def create_visitante(visitante_data: VisitanteRequestCreate, current_user: dict = Depends(require_root_or_admin)):
    service = UsuarioServicios()
    try:
        await service.create_visitante(
            nombre=visitante_data.Nombre,
            genero=visitante_data.Genero,
            apellido_paterno=visitante_data.Apellido_Paterno,
            apellido_materno=visitante_data.Apellido_Materno,
            fecha_nacimiento=visitante_data.Fecha_Nacimiento,
            ine=visitante_data.Ine,
            correo=visitante_data.Correo,
            numero=visitante_data.Numero,
            ingreso=visitante_data.Ingreso
        )
        return {"message": "Visitante creado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@usuarios_routes.post('/usuarios/reset/{email}')
async def usuario_reset_password(email: str, password: str):
    service = UsuarioServicios()
    try:
        await service.reset_password_by_email(email, password)
        return {"message": "Contraseña actualizada"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@usuarios_routes.post('/usuarios/email')
async def send_reset_password(email: str):
    email_service = EmailService()
    success = await email_service.send_reset_password_email(email)
    if not success:
        raise HTTPException(status_code=500, detail="No se pudo enviar el correo")
    return {"message": "Correo de restablecimiento enviado correctamente"}


# ==================== HORARIOS DE COORDINADORES ====================

@usuarios_routes.post('/horarios/add', status_code=status.HTTP_201_CREATED)
async def create_horario(horario_data: HorarioCoordinadorCreate, current_user: dict = Depends(require_root_or_admin)):
    """Crear un bloque de horario para un coordinador"""
    service = UsuarioServicios()
    try:
        horario = await service.create_horario_coordinador(
            usuario_id=horario_data.Usuario_Id,
            dia_semana=horario_data.Dia_Semana,
            hora_inicio=horario_data.Hora_Inicio,
            hora_fin=horario_data.Hora_Fin,
            tipo=horario_data.Tipo,
            descripcion=horario_data.Descripcion
        )
        return {"message": "Horario creado exitosamente", "horario_id": str(horario.Id)}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/horarios/{usuario_id}', status_code=status.HTTP_200_OK, response_model=List[HorarioCoordinadorResponse])
async def get_horarios(usuario_id: UUID, current_user: dict = Depends(require_any_role)):
    """Obtener todos los horarios de un coordinador"""
    service = UsuarioServicios()
    try:
        horarios = await service.get_horarios_coordinador(usuario_id)
        return horarios
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.patch('/horarios/modify/{horario_id}', status_code=status.HTTP_200_OK)
async def update_horario(horario_id: UUID, horario_data: HorarioCoordinadorUpdate, current_user: dict = Depends(require_root_or_admin)):
    """Actualizar un bloque de horario"""
    service = UsuarioServicios()
    try:
        await service.update_horario_coordinador(
            horario_id=horario_id,
            dia_semana=horario_data.Dia_Semana,
            hora_inicio=horario_data.Hora_Inicio,
            hora_fin=horario_data.Hora_Fin,
            tipo=horario_data.Tipo,
            descripcion=horario_data.Descripcion
        )
        return {"message": "Horario actualizado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.delete('/horarios/delete/{horario_id}', status_code=status.HTTP_200_OK)
async def delete_horario(horario_id: UUID, current_user: dict = Depends(require_root_or_admin)):
    """Eliminar un bloque de horario"""
    service = UsuarioServicios()
    try:
        result = await service.delete_horario_coordinador(horario_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@usuarios_routes.get('/horarios/disponibilidad/{usuario_id}', status_code=status.HTTP_200_OK)
async def verificar_disponibilidad(usuario_id: UUID, dia_semana: int, hora: time, current_user: dict = Depends(require_any_role)):
    """Verificar si un coordinador está disponible en un día y hora específicos"""
    service = UsuarioServicios()
    try:
        disponible = await service.verificar_disponibilidad_coordinador(usuario_id, dia_semana, hora)
        return {"disponible": disponible}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))






    



