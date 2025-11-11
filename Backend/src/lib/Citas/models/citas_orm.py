from ....database.database_config import Base
from sqlalchemy import Column,String,ForeignKey,Date,Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4

class CitasORM(Base):

    __tablename__ = "citas"
    Id = Column(UUID(as_uuid=True),primary_key=True,default=uuid4)
    Visitante_Id = Column(UUID(as_uuid=True),ForeignKey('visitantes.Id',ondelete="CASCADE"),nullable=False)
    Usuario_Visitado = Column(UUID(as_uuid=True),ForeignKey('usuarios.Id',ondelete='CASCADE'),nullable=True)
    Nombre_Persona_Visitada = Column(String(255),nullable=True)  # Campo de texto libre para el nombre de la persona
    Carro_Id = Column(UUID(as_uuid=True),ForeignKey('carros.Id',ondelete='CASCADE'),nullable=True)
    Creado_Por = Column(UUID(as_uuid=True),ForeignKey('usuarios.Id',ondelete='CASCADE'),nullable=False)
    Fecha = Column(Date,nullable=False)
    Hora = Column(Time,nullable=False)
    Area = Column(String(100),nullable=False)

    visitante = relationship("VisitanteORM",back_populates="cita")
    usuario_visitado = relationship("UsuarioORM",back_populates="cita",foreign_keys=[Usuario_Visitado])
    creado_por = relationship("UsuarioORM",back_populates="citas_creadas",foreign_keys=[Creado_Por])
    carro = relationship("CarroORM",back_populates="cita")


