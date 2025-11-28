from ....database.database_config import AsyncSessionLocal
from ...Usuarios.models.usuarios_orm import UsuarioORM
from ...Usuarios.models.horario_coordinador_orm import HorarioCoordinadorORM
from ...Citas.models.citas_orm import CitasORM
from ...Carros.models.carro_orm import CarroORM
from ...Visitantes.models.visitantes_orm import VisitanteORM
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import date, time, datetime
from uuid import UUID
from typing import Optional
from .email_servicios import EmailService
from ...auth.auth import get_password_hash,validate_password_strength
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
    



    async def create_cita(self, nombre_persona_visitada:str, usuario_visitado: Optional[UUID],
                      nombre_visitante:str, apellido_paterno_visitante:str, apellido_materno_visitante:str,
                      placas:str, fecha:date, hora:time, area:str, creado_por:UUID):
        async with self._async_session_maker() as session:
            # El nombre de la persona visitada ahora es texto libre, no requiere búsqueda
            # Solo guardamos el texto si se proporcionó
            nombre_persona = None
            if nombre_persona_visitada and nombre_persona_visitada.strip():
                nombre_persona = nombre_persona_visitada.strip()

            # Buscar visitante (obligatorio)
            # Usar nombre y apellido paterno como mínimo, apellido materno solo si existe
            filtrosVisitante = []
            if nombre_visitante:
                filtrosVisitante.append(VisitanteORM.Nombre == nombre_visitante)
            if apellido_paterno_visitante:
                filtrosVisitante.append(VisitanteORM.Apellido_Paterno == apellido_paterno_visitante)
            
            # Solo agregar filtro de apellido materno si tiene un valor real (no vacío ni None)
            if apellido_materno_visitante and apellido_materno_visitante.strip():
                filtrosVisitante.append(VisitanteORM.Apellido_Materno == apellido_materno_visitante)
            else:
                # Si no se proporcionó apellido materno, buscar donde sea NULL o vacío
                filtrosVisitante.append(
                    (VisitanteORM.Apellido_Materno == None) | 
                    (VisitanteORM.Apellido_Materno == "") |
                    (VisitanteORM.Apellido_Materno == "NoEspecificado")
                )
            
            print(f"🔍 Buscando visitante con filtros:")
            print(f"   Nombre: {nombre_visitante}")
            print(f"   Apellido Paterno: {apellido_paterno_visitante}")
            print(f"   Apellido Materno: {apellido_materno_visitante or 'NULL/Vacío'}")
            
            result_visitante = await session.execute(select(VisitanteORM).where(*filtrosVisitante))
            visitante = result_visitante.scalars().first()

            if not visitante:
                # Mensaje de error más detallado
                apellido_completo = f"{apellido_paterno_visitante} {apellido_materno_visitante or '(sin apellido materno)'}"
                raise ValueError(
                    f"Visitante no encontrado: {nombre_visitante} {apellido_completo}. "
                    f"Debe crearse primero antes de agendar la cita."
                )
            
            print(f"✅ Visitante encontrado: {visitante.Nombre} {visitante.Apellido_Paterno} {visitante.Apellido_Materno or '(sin apellido materno)'}")
        
            # Validar que no haya otra cita con el mismo email en la misma fecha
            result_cita_email = await session.execute(
                select(CitasORM)
                .join(VisitanteORM)
                .where(CitasORM.Fecha == fecha)
                .where(VisitanteORM.Correo == visitante.Correo)
            )
            cita_email_existente = result_cita_email.scalars().first()
            
            if cita_email_existente:
                raise ValueError(
                    f"Ya existe una cita registrada para el correo {visitante.Correo} en la fecha {fecha}. "
                    f"No se pueden registrar múltiples citas con el mismo email en el mismo día."
                )
        
            # Validar edad mínima de 15 años
            if visitante.Fecha_Nacimiento:
                hoy = datetime.now().date()
                edad = hoy.year - visitante.Fecha_Nacimiento.year - (
                    (hoy.month, hoy.day) < (visitante.Fecha_Nacimiento.month, visitante.Fecha_Nacimiento.day)
                )
                
                # Log para debugging
                print(f"🔍 DEBUG - Validación de edad:")
                print(f"   Visitante: {visitante.Nombre} {visitante.Apellido_Paterno}")
                print(f"   Fecha de nacimiento: {visitante.Fecha_Nacimiento}")
                print(f"   Fecha actual: {hoy}")
                print(f"   Edad calculada: {edad} años")
                
                if edad < 15:
                    raise ValueError(f"El visitante debe tener al menos 15 años para poder agendar una cita. Edad actual: {edad} años.")
                
                print(f"   ✅ Validación pasada (edad >= 15)")
        
            # Validar que no haya otra cita en el mismo horario (considerando 30 minutos de duración)
            # Convertir hora a minutos totales para facilitar la comparación
            hora_minutos = hora.hour * 60 + hora.minute
            hora_inicio = hora_minutos - 30  # 30 minutos antes
            hora_fin = hora_minutos + 30     # 30 minutos después
            
            # Obtener todas las citas del mismo día
            result_citas_dia = await session.execute(
                select(CitasORM).where(CitasORM.Fecha == fecha)
            )
            citas_dia = result_citas_dia.scalars().all()
            
            # Verificar si hay conflicto de horario
            for cita_existente in citas_dia:
                cita_hora_minutos = cita_existente.Hora.hour * 60 + cita_existente.Hora.minute
                
                # Si la cita existente está dentro del rango de 30 minutos (antes o después)
                if hora_inicio < cita_hora_minutos < hora_fin:
                    raise ValueError(
                        f"Ya existe una cita agendada a las {cita_existente.Hora.strftime('%H:%M')}. "
                        f"Por favor selecciona otro horario (cada cita dura aproximadamente 30 minutos)."
                    )
                
                # También verificar si la nueva cita cae dentro del rango de una cita existente
                cita_existente_inicio = cita_hora_minutos - 30
                cita_existente_fin = cita_hora_minutos + 30
                if cita_existente_inicio < hora_minutos < cita_existente_fin:
                    raise ValueError(
                        f"El horario seleccionado coincide con otra cita agendada a las {cita_existente.Hora.strftime('%H:%M')}. "
                        f"Por favor selecciona otro horario (cada cita dura aproximadamente 30 minutos)."
                    )
        
            carro = None
            # Solo buscar el carro si hay placas válidas
            if placas and placas.strip():
                result = await session.execute(select(CarroORM).where(CarroORM.Placas == placas))
                carro = result.scalars().first()
        
            new_cita = CitasORM(
                Visitante_Id = visitante.Id,
                Usuario_Visitado = usuario_visitado,  # UUID del coordinador asignado
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
                    area=area,
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
            result = await session.execute(
                select(CitasORM)
                .options(
                    selectinload(CitasORM.visitante),
                    selectinload(CitasORM.carro)
                )
                .where(CitasORM.Id == id)
            )
            update_cita = result.scalars().first()

            if not update_cita:
                raise ValueError("Cita no encontrada")

            # Guardar valores anteriores para el correo
            fecha_anterior = update_cita.Fecha
            hora_anterior = update_cita.Hora
            
            # Actualizar fecha y hora
            if fecha:
                update_cita.Fecha = fecha
            if hora:
                update_cita.Hora = hora
            
            await session.commit()
            await session.refresh(update_cita)
            
            # Enviar email de confirmación de reagendado (opcional, no debe bloquear)
            try:
                email_service = EmailService()
                visitante = update_cita.visitante
                
                if visitante and visitante.Correo:
                    # Usar el nombre de la persona visitada o el área
                    nombre_completo_usuario = (
                        update_cita.Nombre_Persona_Visitada 
                        if update_cita.Nombre_Persona_Visitada 
                        else f"Área de {update_cita.Area}"
                    )
                    
                    placas = update_cita.carro.Placas if update_cita.carro else None
                    
                    await email_service.send_reschedule_email(
                        destinatario_email=visitante.Correo,
                        nombre_visitante=visitante.Nombre,
                        apellido_paterno=visitante.Apellido_Paterno,
                        apellido_materno=visitante.Apellido_Materno,
                        nombre_usuario=nombre_completo_usuario,
                        fecha_anterior=fecha_anterior,
                        hora_anterior=hora_anterior,
                        fecha_nueva=update_cita.Fecha,
                        hora_nueva=update_cita.Hora,
                        area=update_cita.Area,
                        placas=placas
                    )
            except Exception as e:
                # Solo logear el error, no fallar la actualización de la cita
                print(f"⚠️ Error al enviar email de reagendado: {str(e)}")
                # La cita ya fue actualizada exitosamente
    
    async def delete_cita_by_id(self, id: UUID, usuario_id: UUID = None, rol: str = None):
        # Verificar permisos si se proporciona usuario y rol
        if usuario_id and rol:
            await self.verificar_permiso_cita(id, usuario_id, rol)
        
        async with self._async_session_maker() as session:
            # Obtener la cita con información del visitante
            result = await session.execute(
                select(CitasORM)
                .options(selectinload(CitasORM.visitante))
                .where(CitasORM.Id == id)
            )
            delete_cita = result.scalars().first()
            
            if not delete_cita:
                raise ValueError("Cita no encontrada")
            
            # Guardar información para el correo antes de eliminar
            visitante = delete_cita.visitante
            fecha_cita = delete_cita.Fecha
            hora_cita = delete_cita.Hora
            area_cita = delete_cita.Area
            nombre_persona_visitada = delete_cita.Nombre_Persona_Visitada
            
            # Enviar correo de cancelación
            try:
                email_service = EmailService()
                await email_service.send_cancellation_email(
                    destinatario_email=visitante.Correo,
                    nombre_visitante=visitante.Nombre,
                    apellido_paterno=visitante.Apellido_Paterno,
                    apellido_materno=visitante.Apellido_Materno,
                    nombre_usuario=nombre_persona_visitada if nombre_persona_visitada else f"Área de {area_cita}",
                    fecha=fecha_cita,
                    hora=hora_cita,
                    area=area_cita
                )
                print(f"✅ Correo de cancelación enviado a {visitante.Correo}")
            except Exception as e:
                print(f"⚠️ Error al enviar correo de cancelación: {str(e)}")
                # Continuar con la eliminación aunque falle el correo
            
            # Guardar el ID del visitante y del carro antes de eliminar la cita
            visitante_id = delete_cita.Visitante_Id
            carro_id = delete_cita.Carro_Id
            
            # Verificar si el visitante tiene otras citas ANTES de eliminar
            otras_citas_visitante = []
            if visitante_id:
                result_otras_citas = await session.execute(
                    select(CitasORM).where(
                        CitasORM.Visitante_Id == visitante_id,
                        CitasORM.Id != id  # Excluir la cita actual
                    )
                )
                otras_citas_visitante = result_otras_citas.scalars().all()
                print(f"🔍 Visitante tiene {len(otras_citas_visitante)} cita(s) adicional(es)")
            
            # Verificar si el carro tiene otras citas ANTES de eliminar
            otras_citas_carro = []
            if carro_id:
                result_otras_citas_carro = await session.execute(
                    select(CitasORM).where(
                        CitasORM.Carro_Id == carro_id,
                        CitasORM.Id != id  # Excluir la cita actual
                    )
                )
                otras_citas_carro = result_otras_citas_carro.scalars().all()
                print(f"🔍 Carro tiene {len(otras_citas_carro)} cita(s) adicional(es)")
            
            # Eliminar la cita
            await session.delete(delete_cita)
            print(f"🗑️ Cita eliminada: {id}")
            
            # Si el visitante no tiene otras citas, eliminarlo también
            if visitante_id and len(otras_citas_visitante) == 0:
                result_visitante = await session.execute(
                    select(VisitanteORM).where(VisitanteORM.Id == visitante_id)
                )
                visitante_obj = result_visitante.scalars().first()
                
                if visitante_obj:
                    await session.delete(visitante_obj)
                    print(f"🗑️ Visitante eliminado: {visitante_obj.Nombre} {visitante_obj.Apellido_Paterno} (no tenía otras citas)")
            elif visitante_id:
                print(f"✓ Visitante conservado: tiene {len(otras_citas_visitante)} cita(s) adicional(es)")
            
            # Si el carro no tiene otras citas, eliminarlo también
            if carro_id and len(otras_citas_carro) == 0:
                result_carro = await session.execute(
                    select(CarroORM).where(CarroORM.Id == carro_id)
                )
                carro_obj = result_carro.scalars().first()
                
                if carro_obj:
                    await session.delete(carro_obj)
                    print(f"🗑️ Carro eliminado: {carro_obj.Marca} {carro_obj.Modelo} - Placas: {carro_obj.Placas} (no tenía otras citas)")
            elif carro_id:
                print(f"✓ Carro conservado: tiene {len(otras_citas_carro)} cita(s) adicional(es)")
            
            # Hacer commit de todas las eliminaciones juntas
            await session.commit()
            print(f"✅ Transacción completada exitosamente")
    


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
            
            except ValueError:
                # Re-lanzar ValueError para mantener el mensaje específico
                raise
            except Exception as e:
                # Para otros errores, usar un mensaje genérico
                raise ValueError("Error al buscar usuario en la base de datos")
    
    async def reset_password_by_email(self, email: str, password: str):
        async with self._async_session_maker() as session:
            try:
                result = await session.execute(select(UsuarioORM).where(UsuarioORM.Email == email))
                usuario = result.scalars().first()
                
                if not usuario:
                    raise ValueError(f"No se encontró un usuario con el email: {email}")
                
                if password:
                    if validate_password_strength(password):
                        usuario.Password = get_password_hash(password)
                        await session.commit()
                        await session.refresh(usuario)
                    else:
                        raise ValueError("La contraseña no cumple con los requisitos mínimos de seguridad")
            except ValueError:
                raise
            except Exception as e:
                await session.rollback()
                raise ValueError(f"Error al actualizar la contraseña: {str(e)}")

    # ==================== HORARIOS DE COORDINADORES ====================
    
    async def create_horario_coordinador(self, usuario_id: UUID, dia_semana: int, 
                                         hora_inicio: time, hora_fin: time, 
                                         tipo: str = "libre", descripcion: str = None):
        """Crear un bloque de horario para un coordinador"""
        async with self._async_session_maker() as session:
            # Verificar que el usuario existe y es admin_escuela
            result = await session.execute(select(UsuarioORM).where(UsuarioORM.Id == usuario_id))
            usuario = result.scalars().first()
            
            if not usuario:
                raise ValueError("Usuario no encontrado")
            
            if usuario.Rol != "admin_escuela":
                raise ValueError("Solo los coordinadores (admin_escuela) pueden tener horarios asignados")
            
            # Verificar que no haya conflicto con horarios existentes
            result = await session.execute(
                select(HorarioCoordinadorORM).where(
                    HorarioCoordinadorORM.Usuario_Id == usuario_id,
                    HorarioCoordinadorORM.Dia_Semana == dia_semana
                )
            )
            horarios_existentes = result.scalars().all()
            
            # Verificar solapamiento de horarios
            for horario in horarios_existentes:
                if not (hora_fin <= horario.Hora_Inicio or hora_inicio >= horario.Hora_Fin):
                    raise ValueError(
                        f"El horario se solapa con otro existente: "
                        f"{horario.Hora_Inicio.strftime('%H:%M')} - {horario.Hora_Fin.strftime('%H:%M')}"
                    )
            
            nuevo_horario = HorarioCoordinadorORM(
                Usuario_Id=usuario_id,
                Dia_Semana=dia_semana,
                Hora_Inicio=hora_inicio,
                Hora_Fin=hora_fin,
                Tipo=tipo,
                Descripcion=descripcion
            )
            
            session.add(nuevo_horario)
            await session.commit()
            await session.refresh(nuevo_horario)
            return nuevo_horario
    
    async def get_horarios_coordinador(self, usuario_id: UUID):
        """Obtener todos los horarios de un coordinador"""
        async with self._async_session_maker() as session:
            result = await session.execute(
                select(HorarioCoordinadorORM)
                .where(HorarioCoordinadorORM.Usuario_Id == usuario_id)
                .order_by(HorarioCoordinadorORM.Dia_Semana, HorarioCoordinadorORM.Hora_Inicio)
            )
            horarios = result.scalars().all()
            return horarios
    
    async def update_horario_coordinador(self, horario_id: UUID, dia_semana: int = None,
                                        hora_inicio: time = None, hora_fin: time = None,
                                        tipo: str = None, descripcion: str = None):
        """Actualizar un bloque de horario"""
        async with self._async_session_maker() as session:
            result = await session.execute(
                select(HorarioCoordinadorORM).where(HorarioCoordinadorORM.Id == horario_id)
            )
            horario = result.scalars().first()
            
            if not horario:
                raise ValueError("Horario no encontrado")
            
            if dia_semana is not None:
                horario.Dia_Semana = dia_semana
            if hora_inicio is not None:
                horario.Hora_Inicio = hora_inicio
            if hora_fin is not None:
                horario.Hora_Fin = hora_fin
            if tipo is not None:
                horario.Tipo = tipo
            if descripcion is not None:
                horario.Descripcion = descripcion
            
            await session.commit()
            await session.refresh(horario)
            return horario
    
    async def delete_horario_coordinador(self, horario_id: UUID):
        """Eliminar un bloque de horario"""
        async with self._async_session_maker() as session:
            result = await session.execute(
                select(HorarioCoordinadorORM).where(HorarioCoordinadorORM.Id == horario_id)
            )
            horario = result.scalars().first()
            
            if not horario:
                raise ValueError("Horario no encontrado")
            
            await session.delete(horario)
            await session.commit()
            return {"message": "Horario eliminado exitosamente"}
    
    async def verificar_disponibilidad_coordinador(self, usuario_id: UUID, dia_semana: int, hora: time):
        """
        Verificar si un coordinador está disponible en un día y hora específicos.
        Retorna True si está libre, False si está ocupado.
        """
        async with self._async_session_maker() as session:
            result = await session.execute(
                select(HorarioCoordinadorORM).where(
                    HorarioCoordinadorORM.Usuario_Id == usuario_id,
                    HorarioCoordinadorORM.Dia_Semana == dia_semana,
                    HorarioCoordinadorORM.Hora_Inicio <= hora,
                    HorarioCoordinadorORM.Hora_Fin > hora
                )
            )
            horario = result.scalars().first()
            
            if not horario:
                # No hay horario definido para este momento
                return False
            
            # Retornar True solo si el horario es de tipo "libre"
            return horario.Tipo == "libre"

    async def actualizar_estados_citas(self):
        """
        Actualiza automáticamente el estado de las citas.
        Las citas cuya fecha y hora ya pasaron se marcan como 'completada'.
        """
        async with self._async_session_maker() as session:
            now = datetime.now()
            
            # Buscar citas activas cuya fecha y hora ya pasaron
            query = select(CitasORM).where(
                CitasORM.Estado == 'activa'
            )
            
            result = await session.execute(query)
            citas = result.scalars().all()
            
            citas_actualizadas = 0
            for cita in citas:
                # Combinar fecha y hora para comparar
                cita_datetime = datetime.combine(cita.Fecha, cita.Hora)
                
                if cita_datetime < now:
                    cita.Estado = 'completada'
                    citas_actualizadas += 1
            
            if citas_actualizadas > 0:
                await session.commit()
                print(f"✅ {citas_actualizadas} citas actualizadas a 'completada'")
            
            return citas_actualizadas

        

        

    



            

        
        
            



