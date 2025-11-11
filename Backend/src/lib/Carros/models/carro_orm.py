from ....database.database_config import Base
from sqlalchemy import Column,String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4

class CarroORM(Base):

    __tablename__ = "carros"
    Id = Column(UUID(as_uuid=True),primary_key=True,default=uuid4)
    Marca = Column(String(20),nullable=False)
    Modelo = Column(String(20),nullable=False)
    Color = Column(String(20),nullable=False)
    Placas = Column(String(12),nullable=False)
    
    cita = relationship("CitasORM",back_populates="carro")
    