from ....database.database_config import Base
from sqlalchemy import Column,String,ForeignKey,Date,Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4

class CitasORM(Base):

    __tablename__ = "citas"
    Id = Column(UUID(as_uuid=True),primary_key=True,default=uuid4)
    Visitante_Id = Column(UUID(as_uuid=True),ForeignKey('visitantes.Id',ondelete="CASCADE"),nullable=False)
    Usuario_Visitado = Column(UUID(as_uuid=True),ForeignKey('usuarios.Id',ondelete='CASCADE'),nullable=False)
    Carro_Id = Column(UUID(as_uuid=True),ForeignKey('carros.Id',ondelete='CASCADE'),nullable=True)
    Fecha = Column(Date,nullable=False)
    Hora = Column(Time,nullable=False)

    visitante = relationship("VisitanteORM",back_populates="cita")
    usuario_visitado = relationship("UsuarioORM",back_populates="cita")
    carro = relationship("CarroORM",back_populates="cita")


