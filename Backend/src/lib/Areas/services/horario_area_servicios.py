from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import time
from uuid import UUID

from ..models.horario_area_orm import HorarioAreaORM
from src.database.database_config import AsyncSessionLocal

class HorarioAreaServicios:
    
    async def create_horario(
        self,
        area: str,
        dia_semana: int,
        hora_inicio: time,
        hora_fin: time,
        tipo: str = "libre",
        descripcion: Optional[str] = None
    ) -> HorarioAreaORM:
        """Crear un nuevo horario para un área"""
        async with AsyncSessionLocal() as session:
            horario = HorarioAreaORM(
                Area=area,
                Dia_Semana=dia_semana,
                Hora_Inicio=hora_inicio,
                Hora_Fin=hora_fin,
                Tipo=tipo,
                Descripcion=descripcion
            )
            session.add(horario)
            await session.commit()
            await session.refresh(horario)
            return horario
    
    async def get_horarios_by_area(self, area: str) -> List[HorarioAreaORM]:
        """Obtener todos los horarios de un área específica"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(HorarioAreaORM)
                .where(HorarioAreaORM.Area == area)
                .order_by(HorarioAreaORM.Dia_Semana, HorarioAreaORM.Hora_Inicio)
            )
            return result.scalars().all()
    
    async def get_all_horarios(self) -> List[HorarioAreaORM]:
        """Obtener todos los horarios de todas las áreas"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(HorarioAreaORM)
                .order_by(HorarioAreaORM.Area, HorarioAreaORM.Dia_Semana, HorarioAreaORM.Hora_Inicio)
            )
            return result.scalars().all()
    
    async def get_horario_by_id(self, horario_id: UUID) -> Optional[HorarioAreaORM]:
        """Obtener un horario específico por su ID"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(HorarioAreaORM).where(HorarioAreaORM.Id == horario_id)
            )
            return result.scalar_one_or_none()
    
    async def update_horario(
        self,
        horario_id: UUID,
        area: Optional[str] = None,
        dia_semana: Optional[int] = None,
        hora_inicio: Optional[time] = None,
        hora_fin: Optional[time] = None,
        tipo: Optional[str] = None,
        descripcion: Optional[str] = None
    ) -> Optional[HorarioAreaORM]:
        """Actualizar un horario existente"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(HorarioAreaORM).where(HorarioAreaORM.Id == horario_id)
            )
            horario = result.scalar_one_or_none()
            
            if not horario:
                return None
            
            if area is not None:
                horario.Area = area
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
    
    async def delete_horario(self, horario_id: UUID) -> bool:
        """Eliminar un horario"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                delete(HorarioAreaORM).where(HorarioAreaORM.Id == horario_id)
            )
            await session.commit()
            return result.rowcount > 0
    
    async def delete_horarios_by_area(self, area: str) -> int:
        """Eliminar todos los horarios de un área"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                delete(HorarioAreaORM).where(HorarioAreaORM.Area == area)
            )
            await session.commit()
            return result.rowcount
