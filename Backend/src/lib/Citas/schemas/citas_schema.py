from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import date, time
from typing import Optional
from ...Usuarios.schemas.usuario_schema import UsuarioResponse,UsuarioResponseDetail
from ...Visitantes.schemas.visitantes_schemas import VisitanteDetailResponse,VisitanteResponse
from ...Carros.schemas.carro_schema import CarroResponse,CarroResponseDetail

class CitasRequestCreate(BaseModel):

    Nombre_Usuario:str
    Apellido_Paterno_Usuario:str
    Apellido_Materno_Usuario:str
    Nombre_Visitante:str
    Apellido_Paterno_Visitante:str
    Apellido_Materno_Visitante:str
    Placas:str = None
    Fecha:date
    Hora:time

    
    @field_validator('Fecha')
    @classmethod
    def validar_fecha(cls, value: date):
        if value < date.today():
            raise ValueError("La fecha no puede ser anterior a la fecha actual.")
        return value

    
    @field_validator('Hora')
    @classmethod
    def validar_hora(cls, value: time):
        if not (0 <= value.hour <= 23 and 0 <= value.minute <= 59):
            raise ValueError("La hora debe ser válida dentro del día.")
        return value

    
    


class CitasRequestUpdate(BaseModel):

    Visitante_Id: Optional[UUID] = Field(None)
    Usuario_Visitado: Optional[UUID] = Field(None)
    Carro_Id: Optional[UUID] = Field(None)
    Fecha: Optional[date] = Field(None)
    Hora: Optional[time] = Field(None)

    @field_validator('Fecha')
    @classmethod
    def validar_fecha(cls, value: Optional[date]):
        if value is None:
            return value
        if value < date.today():
            raise ValueError("La fecha no puede ser anterior a la actual.")
        return value

    @field_validator('Hora')
    @classmethod
    def validar_hora(cls, value: Optional[time]):
        if value is None:
            return value
        if not (0 <= value.hour <= 23 and 0 <= value.minute <= 59):
            raise ValueError("La hora debe ser válida dentro del día.")
        return value

    @field_validator('Visitante_Id', 'Usuario_Visitado', 'Carro_Id')
    @classmethod
    def validar_uuid(cls, value: Optional[UUID]):
        if value is None:
            return value
        if not isinstance(value, UUID):
            raise ValueError("Debe ser un UUID válido.")
        return value

class CitasResponseBase(BaseModel):
    Id:UUID
    Fecha: date
    Hora:time

    model_config = {"from_attributes": True}

class CitasResponse(CitasResponseBase):

    visitante:VisitanteResponse
    carro:Optional[CarroResponse] = None

    model_config = {"from_attributes":True}

class CitasResponseDetail(CitasResponseBase):
    visitante:VisitanteResponse
    carro:Optional[CarroResponseDetail] = None
    
    model_config = {"from_attributes":True}


class CitaResponseAdmin(CitasResponse):

    usuario_visitado:UsuarioResponse

    model_config = {"from_attributes":True}






