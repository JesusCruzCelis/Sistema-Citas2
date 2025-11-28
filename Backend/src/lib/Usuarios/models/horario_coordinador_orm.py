from ....database.database_config import Base
from sqlalchemy import Column, String, ForeignKey, Time, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4

class HorarioCoordinadorORM(Base):
    """
    Modelo para almacenar los horarios de disponibilidad de los coordinadores (admin_escuela).
    Cada coordinador puede tener múltiples bloques de horario a lo largo de la semana.
    """
    __tablename__ = "horarios_coordinadores"
    
    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    Usuario_Id = Column(UUID(as_uuid=True), ForeignKey("usuarios.Id", ondelete="CASCADE"), nullable=False)
    
    # Día de la semana: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
    Dia_Semana = Column(Integer, nullable=False)
    
    # Hora de inicio y fin del bloque
    Hora_Inicio = Column(Time, nullable=False)
    Hora_Fin = Column(Time, nullable=False)
    
    # Tipo de bloque: "libre" (disponible para citas) o "ocupado" (clase u otra actividad)
    Tipo = Column(String(20), nullable=False, default="libre")  # "libre" o "ocupado"
    
    # Descripción opcional (ej: "Clase de Matemáticas", "Hora libre", etc.)
    Descripcion = Column(String(100), nullable=True)
    
    # Relación con el usuario
    usuario = relationship("UsuarioORM", back_populates="horarios", foreign_keys=[Usuario_Id])
