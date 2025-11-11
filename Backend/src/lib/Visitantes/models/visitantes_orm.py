from ....database.database_config import Base
from sqlalchemy import Column,String,Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from ...Citas.models.citas_orm import CitasORM


class VisitanteORM(Base):


    __tablename__ = 'visitantes'
    Id = Column(UUID(as_uuid=True),primary_key=True,default=uuid4)
    Nombre = Column(String(30),nullable=False)
    Genero = Column(String(30),nullable=False)
    Apellido_Paterno = Column(String(30),nullable=False)
    Apellido_Materno = Column(String(30),nullable=False)
    Fecha_Nacimiento = Column(Date,nullable=False)
    Ine = Column(String(10),nullable=False,unique=True,index=True)
    Correo = Column(String(150),nullable=False,unique=True)
    Numero = Column(String(12),nullable=False,unique=True)
    Ingreso = Column(String(15),nullable=False)

    cita = relationship("CitasORM",back_populates="visitante",passive_deletes=True)
    