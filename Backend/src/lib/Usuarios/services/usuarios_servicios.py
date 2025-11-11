from ....database.database_config import AsyncSessionLocal
from ...Usuarios.models.usuarios_orm import UsuarioORM
from ...Citas.models.citas_orm import CitasORM
from ...Carros.models.carro_orm import CarroORM
from ...Visitantes.models.visitantes_orm import VisitanteORM
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import date,time
from uuid import UUID
from .email_servicios import EmailService
from ...auth.auth import get_password_hash
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

class UsuarioServicios:

    def __init__(self,async_session_maker = AsyncSessionLocal):
        self._async_session_maker = async_session_maker
    
    async def get_citas(self, usuario_id: UUID = None, rol: str = None):
        async with self._async_session_maker() as session:
            query = select(CitasORM).options(
                selectinload(CitasORM.visitante),
                selectinload(CitasORM.carro),
                selectinload(CitasORM.usuario_visitado)
            )
            
            # Si es admin_escuela, solo mostrar sus citas creadas
            if rol == "admin_escuela" and usuario_id:
                query = query.where(CitasORM.Creado_Por == usuario_id)
            
            # admin_sistema y vigilancia ven todas las citas
            
            results = await session.execute(query)
            citas = results.scalars().all()
            return citas
    
    async def get_citas_by_id(self,id:UUID):
        async with self._async_session_maker() as session:
            results = await session.execute(select(CitasORM).options(selectinload(CitasORM.visitante),selectinload(CitasORM.carro)).where(CitasORM.Usuario_Visitado == id))
            citas = results.scalars().all()

            return citas 
    
    async def get_cita_detail(self,id:UUID):
        async with self._async_session_maker() as session:
            result = await session.execute(select(CitasORM).options(selectinload(CitasORM.visitante),selectinload(CitasORM.carro)).where(CitasORM.Id == id))
            usuario = result.scalars().first()
            return usuario

    async def get_citas_by_usuario_visitado(self,nombre:str = None,apellido_paterno= None,apellido_materno= None):
        async with self._async_session_maker() as session:
            filtrosUsuario = []
            if nombre:
                filtrosUsuario.append(UsuarioORM.Nombre == nombre)
            if apellido_paterno:
                filtrosUsuario.append(UsuarioORM.Apellido_Paterno == apellido_paterno)
            if apellido_materno:
                filtrosUsuario.append(UsuarioORM.Apellido_Materno == apellido_materno)
            result = await session.execute(select(UsuarioORM).where(*filtrosUsuario))
            usuario = result.scalars().first()
            if usuario:
                results = await session.execute(select(CitasORM).options(selectinload(CitasORM.visitante),selectinload(CitasORM.carro)).where(CitasORM.Usuario_Visitado == usuario.Id))
                citas = results.scalars().all()
                return citas
            else:
                return None
    
    async def get_cita_by_visitante(self,nombre:str = None,apellido_paterno= None,apellido_materno= None):
        async with self._async_session_maker() as session:
            filtrosVisitante = []
            if nombre:
                filtrosVisitante.append(VisitanteORM.Nombre == nombre)
            if apellido_paterno:
                filtrosVisitante.append(VisitanteORM.Apellido_Paterno == apellido_paterno)
            if apellido_materno:
                filtrosVisitante.append(VisitanteORM.Apellido_Materno == apellido_materno)
            result = await session.execute(select(VisitanteORM).where(*filtrosVisitante))
            visitante = result.scalars().first()  
            if visitante:
                results = await session.execute(select(CitasORM).options(selectinload(CitasORM.visitante),selectinload(CitasORM.carro)).where(CitasORM.Visitante_Id == visitante.Id))
                citas = results.scalars().first()
                return citas
            else:
                return  None
    
    async def get_cita_by_fecha(self,fecha:date):
        async with self._async_session_maker() as session:
            result = await session.execute(select(CitasORM).where(CitasORM.Fecha == fecha))
            citas = result.scalars().all()
            return citas or None
    
    async def get_usuario_by_nombre(self,nombre:str,apellido_paterno:str,apellido_materno:str):
        async with self._async_session_maker() as session:
            filtrosUsuario = []
            if nombre:
                filtrosUsuario.append(UsuarioORM.Nombre == nombre)
            if apellido_paterno:
                filtrosUsuario.append(UsuarioORM.Apellido_Paterno == apellido_paterno)
            if apellido_materno:
                filtrosUsuario.append(UsuarioORM.Apellido_Materno == apellido_materno)
            result = await session.execute(select(UsuarioORM).where(*filtrosUsuario))
            usuario = result.scalars().first()
            return usuario or None
        
    async def get_visitante_by_nombre(self,nombre:str,apellido_paterno:str,apellido_materno:str):
        async with self._async_session_maker() as session:
            filtrosVisitante = []
            if nombre:
                filtrosVisitante.append(VisitanteORM.Nombre == nombre)
            if apellido_paterno:
                filtrosVisitante.append(VisitanteORM.Apellido_Paterno == apellido_paterno)
            if apellido_materno:
                filtrosVisitante.append(VisitanteORM.Apellido_Materno == apellido_materno)
            result = await session.execute(select(VisitanteORM).where(*filtrosVisitante))
            visitante = result.scalars().first()
            return visitante or None
    



    async def create_cita(self, nombre_persona_visitada:str,
                      nombre_visitante:str, apellido_paterno_visitante:str, apellido_materno_visitante:str,
                      placas:str, fecha:date, hora:time, area:str, creado_por:UUID):
        async with self._async_session_maker() as session:
            # El nombre de la persona visitada ahora es texto libre, no requiere búsqueda
            # Solo guardamos el texto si se proporcionó
            nombre_persona = None
            if nombre_persona_visitada and nombre_persona_visitada.strip():
                nombre_persona = nombre_persona_visitada.strip()

            # Buscar visitante (obligatorio)
            filtrosVisitante = []
            if nombre_visitante:
                filtrosVisitante.append(VisitanteORM.Nombre == nombre_visitante)
            if apellido_paterno_visitante:
                filtrosVisitante.append(VisitanteORM.Apellido_Paterno == apellido_paterno_visitante)
            if apellido_materno_visitante:
                filtrosVisitante.append(VisitanteORM.Apellido_Materno == apellido_materno_visitante)
            
            result_visitante = await session.execute(select(VisitanteORM).where(*filtrosVisitante))
            visitante = result_visitante.scalars().first()

            if not visitante:
                raise ValueError(f"Visitante no encontrado: {nombre_visitante} {apellido_paterno_visitante} {apellido_materno_visitante}. Debe crearse primero antes de agendar la cita.")
        
            carro = None
            # Solo buscar el carro si hay placas válidas
            if placas and placas.strip():
                result = await session.execute(select(CarroORM).where(CarroORM.Placas == placas))
                carro = result.scalars().first()
        
            new_cita = CitasORM(
                Visitante_Id = visitante.Id,
                Usuario_Visitado = None,  # Ya no usamos esta relación
                Nombre_Persona_Visitada = nombre_persona,  # Guardamos el texto libre
                Carro_Id = carro.Id if carro else None,
                Creado_Por = creado_por,
                Fecha = fecha,
                Hora = hora,
                Area = area
            )
            session.add(new_cita)
            await session.commit()
            await session.refresh(new_cita)
        
            # Enviar email de confirmación (opcional, no debe bloquear la cita)
            try:
                email_service = EmailService()
                
                # Usar el nombre de la persona visitada o el área
                nombre_completo_usuario = nombre_persona if nombre_persona else f"Área de {area}"
            
                await email_service.send_confirmation_email(
                    destinatario_email=visitante.Correo,
                    nombre_visitante=visitante.Nombre,
                    apellido_paterno=visitante.Apellido_Paterno,
                    apellido_materno=visitante.Apellido_Materno,
                    nombre_usuario=nombre_completo_usuario,
                    fecha=fecha,
                    hora=hora,
                    placas=placas
                )
            except Exception as e:
                # Solo logear el error, no fallar la creación de la cita
                print(f"Error al enviar email de confirmación: {str(e)}")
                # La cita ya fue creada exitosamente
    
    async def verificar_permiso_cita(self, cita_id: UUID, usuario_id: UUID, rol: str):
        """Verifica si el usuario tiene permiso para modificar/eliminar una cita"""
        async with self._async_session_maker() as session:
            result = await session.execute(select(CitasORM).where(CitasORM.Id == cita_id))
            cita = result.scalars().first()
            
            if not cita:
                raise ValueError("Cita no encontrada")
            
            # admin_sistema tiene acceso total
            if rol == "admin_sistema":
                return True
            
            # admin_escuela solo puede modificar sus propias citas
            if rol == "admin_escuela":
                if cita.Creado_Por == usuario_id:
                    return True
                else:
                    raise HTTPException(
                        status_code=403,
                        detail="No tienes permiso para modificar esta cita. Solo puedes modificar las citas que tú creaste."
                    )
            
            # vigilancia no puede modificar ninguna cita
            raise HTTPException(
                status_code=403,
                detail="Tu rol no tiene permisos para modificar citas."
            )
    
    async def update_cita_by_id(self,id:UUID,fecha:date=None,hora:time=None,usuario_id:UUID=None,rol:str=None):
        # Verificar permisos si se proporciona usuario y rol
        if usuario_id and rol:
            await self.verificar_permiso_cita(id, usuario_id, rol)
        
        async with self._async_session_maker() as session: 
            result = await session.execute(select(CitasORM).where(CitasORM.Id == id))
            update_cita = result.scalars().first()

            if not update_cita:
                raise ValueError("Cita no encontrada")

            if fecha:
                update_cita.Fecha = fecha
            if hora:
                update_cita.Hora = hora
            await session.commit()
            await session.refresh(update_cita)
    
    async def delete_cita_by_id(self,id:UUID,usuario_id:UUID=None,rol:str=None):
        # Verificar permisos si se proporciona usuario y rol
        if usuario_id and rol:
            await self.verificar_permiso_cita(id, usuario_id, rol)
        
        async with self._async_session_maker() as session:
            result = await session.execute(select(CitasORM).where(CitasORM.Id == id))
            delete_cita = result.scalars().first()
            
            if not delete_cita:
                raise ValueError("Cita no encontrada")
            
            await session.delete(delete_cita)
            await session.commit()
    


    async def create_user(
        self, 
        nombre: str, 
        apellido_paterno: str, 
        apellido_materno: str, 
        password: str, 
        email: str, 
        rol: str, 
        rol_escuela: str,
        area: str
        ):
        async with self._async_session_maker() as session:
            try:
                # Hashear la contraseña antes de guardar
                hashed_password = get_password_hash(password)
            
                new_user = UsuarioORM(
                    Nombre=nombre,
                    Apellido_Paterno=apellido_paterno,
                    Apellido_Materno=apellido_materno,
                    Password=hashed_password,
                    Email=email,
                    Rol=rol,
                    Rol_Escuela=rol_escuela,
                    Area=area
                )
            
                session.add(new_user)
                await session.commit()
                await session.refresh(new_user)
            
                return new_user
            
            except ValueError as e:
                await session.rollback()
                raise e
            except Exception as e:
                await session.rollback()
                raise Exception(f"Error al crear usuario: {str(e)}")
    
    async def delete_user_by_id(self,id:UUID):
        async with self._async_session_maker() as session:
            result = await session.execute(select(UsuarioORM).where(UsuarioORM.Id == id))
            delete_usuario = result.scalars().first()
            await session.delete(delete_usuario)
            await session.commit()
    
    async def get_user(self):
        async with self._async_session_maker() as session:
            result = await session.execute(select(UsuarioORM))
            usuarios = result.scalars().all()
            return usuarios
    
    async def get_user_by_id_detail(self,id:UUID):
        async with self._async_session_maker() as session:
            result = await session.execute(select(UsuarioORM).where(UsuarioORM.Id == id))
            usuario = result.scalars().first()
            return usuario
        
    
    async def update_user_by_id(self,id:UUID,nombre:str=None,apellido_paterno:str=None,apellido_materno:str=None,password:str=None,email:str=None,
                                rol:str=None,rol_escuela:str=None,area:str=None):
        async with self._async_session_maker() as session:
            result = await session.execute(select(UsuarioORM).where(UsuarioORM.Id == id))
            update_user = result.scalars().first()

            if update_user:
                if nombre:
                    update_user.Nombre = nombre
                if apellido_paterno:
                    update_user.Apellido_Paterno = apellido_paterno
                if apellido_materno:
                    update_user.Apellido_Materno = apellido_materno
                if password:
                    # Hashear la contraseña antes de actualizar
                    update_user.Password = get_password_hash(password)
                if email:
                    update_user.Email = email
                if rol:
                    update_user.Rol = rol
                if rol_escuela:
                    update_user.Rol_Escuela = rol_escuela
                if area:
                    update_user.Area = area
                
                await session.commit()
                await session.refresh(update_user)
    
    async def get_user_by_rol(self,rol:str):
        async with self._async_session_maker() as session:
            result = await session.execute(select(UsuarioORM).where(UsuarioORM.Rol == rol))
            user = result.scalars().all()
            return user

    async def create_visitante(self,nombre:str,genero:str,apellido_paterno:str,apellido_materno:str,fecha_nacimiento:date,ine:str,correo:str,numero:str,ingreso:str):
        async with self._async_session_maker() as session:
            # Verificar si el visitante ya existe por INE (identificación única)
            # El INE es único - cada persona tiene solo un INE
            # El correo y número NO son únicos - pueden repetirse entre diferentes personas
            if ine and ine.strip():
                # Buscar primero solo por INE
                result = await session.execute(
                    select(VisitanteORM).where(VisitanteORM.Ine == ine)
                )
                existing_visitante = result.scalars().first()
                
                if existing_visitante:
                    # Verificar si es la misma persona (mismo INE + mismo nombre)
                    if (existing_visitante.Nombre == nombre and 
                        existing_visitante.Apellido_Paterno == apellido_paterno):
                        # Es la misma persona, reutilizar el registro
                        return existing_visitante
                    else:
                        # Es un INE duplicado con nombre diferente - ERROR
                        raise HTTPException(
                            status_code=400,
                            detail=f"El INE {ine} ya está registrado para otra persona ({existing_visitante.Nombre} {existing_visitante.Apellido_Paterno}). Por favor verifica el número de INE."
                        )
            
            # Si no existe, crear el nuevo visitante
            new_visitante = VisitanteORM(
                Nombre = nombre,
                Genero = genero,
                Apellido_Paterno = apellido_paterno,
                Apellido_Materno = apellido_materno,
                Fecha_Nacimiento = fecha_nacimiento,
                Ine = ine,
                Correo = correo,
                Numero = numero,
                Ingreso = ingreso
            )
            session.add(new_visitante)
            await session.commit()
            await session.refresh(new_visitante)
            return new_visitante
    
    async def update_visitante_by_id(self,id:UUID,nombre:str = None,genero:str = None,apellido_paterno:str= None,apellido_materno:str= None,fecha_nacimiento:date= None,
                                     ine:str= None,correo:str= None,numero:str= None,ingreso:str= None):
        async with self._async_session_maker() as session:
            result = await session.execute(select(VisitanteORM).where(VisitanteORM.Id == id))
            update_visitante = result.scalars().first()
            if not update_visitante:
                raise ValueError("El visitante no fue encontrado")
            if update_visitante:
                if nombre:
                    update_visitante.Nombre = nombre
                if genero:
                    update_visitante.Genero = genero
                if apellido_paterno:
                    update_visitante.Apellido_Paterno = apellido_paterno
                if apellido_materno:
                    update_visitante.Apellido_Materno = apellido_materno
                if fecha_nacimiento:
                    update_visitante.Fecha_Nacimiento = fecha_nacimiento
                if ine:
                    update_visitante.Ine = ine
                if correo:
                    update_visitante.Correo = correo
                if numero:
                    update_visitante.Numero = numero
                if ingreso:
                    update_visitante.Ingreso = ingreso

                await session.commit()
                await session.refresh(update_visitante)
        
    async def delete_visitante_by_id(self,id:UUID):
        async with self._async_session_maker() as session:
            result = await session.execute(select(VisitanteORM).where(VisitanteORM.Id == id))
            delete_visitante = result.scalars().first()

            if not delete_visitante:
                raise ValueError("visitante no encontrado")

            await session.delete(delete_visitante)
            await session.commit()

    async def create_car(self,marca:str,modelo:str,color:str,placas:str):
        async with self._async_session_maker() as session:
            # Verificar si el carro ya existe por placas
            result = await session.execute(select(CarroORM).where(CarroORM.Placas == placas))
            existing_car = result.scalars().first()
            if existing_car:
                # Si ya existe, no lo creamos de nuevo, simplemente retornamos
                return existing_car
            
            # Si no existe, crear el nuevo carro
            new_car = CarroORM(
                Marca = marca,
                Modelo = modelo,
                Color = color,
                Placas = placas
            )

            session.add(new_car)
            await session.commit()
            await session.refresh(new_car)
            return new_car
    
    async def get_user_by_rol_escuela(self,rol:str):
        async with self._async_session_maker() as session:
            result = await session.execute(select(UsuarioORM).where(UsuarioORM.Rol_Escuela == rol))
            usuario = result.scalars().all()
            return usuario
    
    async def get_user_by_area(self,area:str):
        async with self._async_session_maker() as session:
            results = await session.execute(select(UsuarioORM).where(UsuarioORM.Area == area))
            usuarios = results.scalars().all()
            return usuarios 
    
    async def get_user_by_email(self, email: str):
        async with self._async_session_maker() as session:
            try:
                result = await session.execute(
                select(UsuarioORM).where(UsuarioORM.Email == email)
                )
                usuario = result.scalar_one_or_none()
            
                if not usuario:
                    raise ValueError("Usuario no encontrado")
            
                return usuario
            
            except Exception as e:
                raise ValueError(f"Error al buscar usuario: {str(e)}")

        

    



            

        
        
            



