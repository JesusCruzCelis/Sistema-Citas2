from ....database.database_config import Base
from sqlalchemy import Column,String,ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from ...Citas.models.citas_orm import CitasORM

class UsuarioORM(Base):

    __tablename__ = "usuarios"
    Id = Column(UUID(as_uuid=True),primary_key=True,default=uuid4)
    Nombre = Column(String(30),nullable=False)
    Apellido_Paterno = Column(String(30),nullable=False)
    Apellido_Materno = Column(String(30),nullable=False)
    Password = Column(String(255),nullable=False)
    Email = Column(String(150),nullable=False,unique=True)
    Rol = Column(String(30),nullable=False)
    Rol_Escuela = Column(String(30),nullable=False)
    Area= Column(String(50),nullable=False)

    
    cita = relationship("CitasORM",back_populates="usuario_visitado",passive_deletes=True)





