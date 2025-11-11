from pydantic import BaseModel,Field,field_validator,EmailStr
from typing import Optional
from uuid import UUID


class UsuarioRequestCreate(BaseModel):

    Nombre:str = Field(...,max_length=30)
    Apellido_Paterno:str = Field(...,max_length=30)
    Apellido_Materno:str = Field(...,max_length=30)
    Password:str = Field(...,min_length=8,max_length=100)
    Email:EmailStr = Field(...)
    Rol:str = Field(...,max_length=30)
    Rol_Escuela:str = Field(...,max_length=30)
    Area:str = Field(...,max_length=50)

    @field_validator('Nombre','Rol','Apellido_Paterno','Apellido_Materno','Rol_Escuela')
    @classmethod
    def validar_atributos(cls,value:str):
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo deben contener letras")
        return value
    
    @field_validator('Password')
    @classmethod
    def validar_password(cls,value:str):
        if " " in value:
            raise ValueError("La contraseña no puede tener espacios en blanco")
        return value

class UsuarioRequestUpdate(BaseModel):

    Nombre:Optional[str] = Field(None,max_length=30)
    Apellido_Paterno:Optional[str] = Field(None,max_length=30)
    Apellido_Materno:Optional[str] = Field(None,max_length=30)
    Password:Optional[str] = Field(None,min_length=8,max_length=100)
    Email:Optional[EmailStr] = Field(None)
    Rol:Optional[str] = Field(None,max_length=30)
    Rol_Escuela:str = Field(None,max_digits=30)
    Area:str = Field(...,max_length=50)


    @field_validator('Nombre','Rol','Apellido_Paterno','Apellido_Materno','Rol_Escuela')
    @classmethod
    def validar_atributos(cls,value:str):
        if value is None:
            return value
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo deben contener letras")
        return value

    @field_validator('Password')
    @classmethod
    def validar_password(cls,value:str):
        if value is None:
            return value
        if " " in value:
            raise ValueError("La contraseña no puede tener espacios en blanco")
        return value

class UsuarioSearchByName(BaseModel):
    Nombre:str = Field(...,max_length=30)
    Apellido_Paterno:str = Field(...,max_length=30)
    Apellido_Materno:str = Field(...,max_length=30)
    @field_validator('Nombre','Apellido_Paterno','Apellido_Materno')
    @classmethod
    def validar_atributos(cls,value:str):
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo deben contener letras")
        return value




class UsuarioResponse(BaseModel):
    Nombre:str
    Apellido_Paterno:str
    Apellido_Materno:str

    model_config = {"from_attributes": True}
    
class UsuarioResponseDetail(UsuarioResponse):
    Email:EmailStr
    Rol:str
    

    model_config = {"from_attributes": True}
