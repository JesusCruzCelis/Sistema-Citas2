from sqlalchemy import Column, String, Integer, Time, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from src.database.database_config import Base

class TipoHorario(str, enum.Enum):
    libre = "libre"
    ocupado = "ocupado"

class DiaSemana(int, enum.Enum):
    LUNES = 0
    MARTES = 1
    MIERCOLES = 2
    JUEVES = 3
    VIERNES = 4
    SABADO = 5
    DOMINGO = 6

class HorarioAreaORM(Base):
    __tablename__ = "horarios_areas"

    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    Area = Column(String, nullable=False, index=True)
    Dia_Semana = Column(Integer, nullable=False)  # 0=Lunes, 1=Martes, ..., 6=Domingo
    Hora_Inicio = Column(Time, nullable=False)
    Hora_Fin = Column(Time, nullable=False)
    Tipo = Column(SQLEnum(TipoHorario), nullable=False, default=TipoHorario.libre)
    Descripcion = Column(String, nullable=True)
