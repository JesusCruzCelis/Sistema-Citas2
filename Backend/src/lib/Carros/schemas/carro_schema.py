from pydantic import BaseModel,Field,field_validator
from typing import Optional

from pydantic import BaseModel, Field, field_validator

class CarroRequestCreate(BaseModel):
    Marca: str = Field(..., max_length=20, alias="marca")
    Modelo: str = Field(..., max_length=20, alias="modelo")
    Color: str = Field(..., max_length=20, alias="color")
    Placas: str = Field(..., max_length=12, alias="placas")

    @field_validator('Marca', 'Modelo', 'Color')
    @classmethod
    def validar_atributos(cls, value: str):
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo deben contener letras")
        return value

    @field_validator('Placas')
    @classmethod
    def validar_placas(cls, value: str):
        if " " in value:
            raise ValueError("Las placas no pueden tener espacios en blanco")
        return value

    class Config:
        allow_population_by_field_name = True


class CarroRequestUpdate(BaseModel):

    Marca:Optional[str] = Field(None,max_length=20)
    Modelo:Optional[str] = Field(None,max_length=20)
    Color:Optional[str] = Field(None,max_length=20)
    Placas:Optional[str] = Field(None,max_length=12)

    @field_validator('Marca','Modelo','Color')
    @classmethod
    def validar_atributos(cls,value:str):
        if value is None:
            return value
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo deben contener letras")
        return value
    
    @field_validator('Placas')
    @classmethod
    def validar_placas(cls,value:str):
        if value is None:
            return value
        if " " in value:
            raise ValueError("Las placas no pueden tener esapcios en blanco")

class CarroResponse(BaseModel):
    Marca:str
    Placas:str

class CarroResponseDetail(CarroResponse):
    Color:str
    Modelo:str


    


