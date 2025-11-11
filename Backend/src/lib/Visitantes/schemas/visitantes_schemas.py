from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date
from typing import Optional

class VisitanteRequestCreate(BaseModel):
    Nombre: str = Field(..., max_length=30)
    Genero: str = Field(..., max_length=1)
    Apellido_Paterno:str = Field(..., max_length=30)
    Apellido_Materno:str = Field(..., max_length=30)
    Fecha_Nacimiento:date = Field(...)
    Ine: str = Field(..., max_length=10)
    Correo: EmailStr = Field(..., max_length=150)
    Numero: str = Field(..., max_length=12)
    Ingreso: str = Field(..., max_length=15)

    
    @field_validator('Nombre', 'Apellido_Paterno', 'Apellido_Materno', 'Ingreso')
    @classmethod
    def validar_atributos(cls, value: str):
        if " " in value:
            raise ValueError("No puede contener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo se permiten letras")
        return value

    @field_validator('Genero')
    @classmethod
    def validar_genero(cls, value: str):
        if len(value) != 1 or not value.isalpha():
            raise ValueError("El género debe ser una sola letra")
        return value.upper()

    @field_validator('Fecha_Nacimiento')
    @classmethod
    def validar_fecha(cls, value: date):
        if value > date.today():
            raise ValueError("La fecha de nacimiento no es valida")
        return value

    @field_validator('Numero')
    @classmethod
    def validar_numero(cls, value: str):
        if " " in value:
            raise ValueError("El número telefónico no puede tener espacios en blanco")
        if not value.isdigit():
            raise ValueError("El número telefónico solo puede contener dígitos")
        return value

        
class VisitanteRequestUpdate(BaseModel):
    Nombre: Optional[str] = Field(None, max_length=30)
    Genero: Optional[str] = Field(None, max_length=1)
    Apellido_Paterno: Optional[str] = Field(None, max_length=30)
    Apellido_Materno: Optional[str] = Field(None, max_length=30)
    Fecha_Nacimiento: Optional[date] = Field(None)
    Ine: Optional[str] = Field(None, max_length=10)
    Correo: Optional[EmailStr] = Field(None, max_length=150)
    Numero: Optional[str] = Field(None, max_length=12)
    Ingreso: Optional[str] = Field(None, max_length=15)

    
    @field_validator('Nombre', 'Apellido_Paterno', 'Apellido_Materno', 'Ingreso')
    @classmethod
    def validar_textos(cls, value: Optional[str]):
        if value is None:
            return value
        if " " in value:
            raise ValueError("No puede contener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo se permiten letras")
        return value

    @field_validator('Genero')
    @classmethod
    def validar_genero(cls, value: Optional[str]):
        if value is None:
            return value
        if len(value) != 1 or not value.isalpha():
            raise ValueError("El género debe ser una sola letra (por ejemplo 'M' o 'F')")
        return value.upper()

    @field_validator('Fecha_Nacimiento')
    @classmethod
    def validar_fecha(cls, value: Optional[date]):
        if value is None:
            return value
        if value > date.today():
            raise ValueError("La fecha de nacimiento no puede ser futura")
        return value

    @field_validator('Numero')
    @classmethod
    def validar_numero(cls, value: Optional[str]):
        if value is None:
            return value
        if " " in value:
            raise ValueError("El número telefónico no puede tener espacios en blanco")
        if not value.isdigit():
            raise ValueError("El número telefónico solo puede contener dígitos")
        return value


class VisitanteResponse(BaseModel):
    Nombre: str
    Genero: str
    Apellido_Paterno: str 
    Apellido_Materno:str
    Numero: str
    Ingreso:str

    model_config = {"from_attributes": True}

class VisitanteDetailResponse(VisitanteResponse):
    Fecha_Nacimiento:str
    Ine:str
    Correo:EmailStr

    model_config = {"from_attributes": True}







