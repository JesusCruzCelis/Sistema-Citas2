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

    @field_validator('Nombre','Apellido_Paterno','Apellido_Materno')
    @classmethod
    def validar_nombres(cls,value:str):
        # Permitir letras y espacios para nombres compuestos como "Juan Carlos"
        if not all(c.isalpha() or c.isspace() for c in value):
            raise ValueError("Solo puede contener letras y espacios")
        # No permitir múltiples espacios consecutivos
        if "  " in value:
            raise ValueError("No puede tener espacios múltiples consecutivos")
        # No permitir espacios al inicio o final
        if value != value.strip():
            raise ValueError("No puede tener espacios al inicio o final")
        return value.strip()
    
    @field_validator('Rol_Escuela')
    @classmethod
    def validar_rol_escuela(cls,value:str):
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        if not value.isalpha():
            raise ValueError("Solo deben contener letras")
        return value
    
    @field_validator('Rol')
    @classmethod
    def validar_rol(cls,value:str):
        if " " in value:
            raise ValueError("No puede tener espacios en blanco")
        # Permitir letras y guiones bajos para roles como admin_sistema
        if not all(c.isalpha() or c == '_' for c in value):
            raise ValueError("Solo puede contener letras y guiones bajos")
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
    Id:UUID
    Nombre:str
    Apellido_Paterno:str
    Apellido_Materno:str
    Area:str

    model_config = {"from_attributes": True}
    
class UsuarioResponseDetail(UsuarioResponse):
    Email:EmailStr
    Rol:str
    Rol_Escuela:str

    model_config = {"from_attributes": True}
