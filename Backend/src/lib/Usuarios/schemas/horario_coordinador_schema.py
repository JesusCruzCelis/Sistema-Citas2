from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import time
from typing import Optional, Literal

class HorarioCoordinadorBase(BaseModel):
    Dia_Semana: int = Field(..., ge=0, le=6, description="Día de la semana: 0=Lunes, 6=Domingo")
    Hora_Inicio: time = Field(..., description="Hora de inicio del bloque")
    Hora_Fin: time = Field(..., description="Hora de fin del bloque")
    Tipo: Literal["libre", "ocupado"] = Field(default="libre", description="Tipo de horario: libre u ocupado")
    Descripcion: Optional[str] = Field(None, max_length=100, description="Descripción opcional del bloque")
    
    @field_validator('Hora_Fin')
    @classmethod
    def validar_hora_fin(cls, v, info):
        if 'Hora_Inicio' in info.data and v <= info.data['Hora_Inicio']:
            raise ValueError('La hora de fin debe ser posterior a la hora de inicio')
        return v

class HorarioCoordinadorCreate(HorarioCoordinadorBase):
    Usuario_Id: UUID = Field(..., description="ID del coordinador")

class HorarioCoordinadorUpdate(BaseModel):
    Dia_Semana: Optional[int] = Field(None, ge=0, le=6)
    Hora_Inicio: Optional[time] = None
    Hora_Fin: Optional[time] = None
    Tipo: Optional[Literal["libre", "ocupado"]] = None
    Descripcion: Optional[str] = Field(None, max_length=100)

class HorarioCoordinadorResponse(HorarioCoordinadorBase):
    Id: UUID
    Usuario_Id: UUID
    
    class Config:
        from_attributes = True

class HorarioSemanalResponse(BaseModel):
    """Respuesta con todos los horarios de un coordinador organizados por día"""
    usuario_id: UUID
    nombre_completo: str
    horarios: dict[int, list[HorarioCoordinadorResponse]]  # Dict con día_semana como clave
    
    class Config:
        from_attributes = True
