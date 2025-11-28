from pydantic import BaseModel, Field
from typing import Optional
from datetime import time
from uuid import UUID

class HorarioAreaCreate(BaseModel):
    Area: str = Field(..., description="Nombre del área")
    Dia_Semana: int = Field(..., ge=0, le=6, description="Día de la semana (0=Lunes, 6=Domingo)")
    Hora_Inicio: time = Field(..., description="Hora de inicio")
    Hora_Fin: time = Field(..., description="Hora de fin")
    Tipo: str = Field(default="libre", description="Tipo de horario (libre u ocupado)")
    Descripcion: Optional[str] = Field(None, description="Descripción opcional del horario")

class HorarioAreaUpdate(BaseModel):
    Area: Optional[str] = None
    Dia_Semana: Optional[int] = Field(None, ge=0, le=6)
    Hora_Inicio: Optional[time] = None
    Hora_Fin: Optional[time] = None
    Tipo: Optional[str] = None
    Descripcion: Optional[str] = None

class HorarioAreaResponse(BaseModel):
    Id: UUID
    Area: str
    Dia_Semana: int
    Hora_Inicio: time
    Hora_Fin: time
    Tipo: str
    Descripcion: Optional[str]

    class Config:
        from_attributes = True
