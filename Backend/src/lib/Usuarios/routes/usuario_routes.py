from fastapi.exceptions import HTTPException
from fastapi import APIRouter, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from datetime import date, time
from uuid import UUID
from ..services.usuarios_servicios import UsuarioServicios
from ..schemas.usuario_schema import UsuarioResponse, UsuarioRequestCreate, UsuarioRequestUpdate, UsuarioSearchByName, UsuarioResponseDetail
from ...Citas.schemas.citas_schema import CitasRequestCreate, CitasResponse, CitasResponseDetail, CitaResponseAdmin
from ...Carros.schemas.carro_schema import CarroRequestCreate
from ...Visitantes.schemas.visitantes_schemas import VisitanteRequestCreate
from ...auth.auth import verify_access_token


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


@usuarios_routes.get('/usuarios', status_code=status.HTTP_200_OK, response_model=List[UsuarioResponse])
async def get_usuarios(current_user: dict = Depends(require_root)):
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


@usuarios_routes.delete('/usuarios/delete', status_code=status.HTTP_200_OK)
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






    



