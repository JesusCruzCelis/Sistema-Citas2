# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar herramientas de compilación necesarias para asyncpg
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar uv
RUN pip install uv

# Copiar archivos de configuración
COPY pyproject.toml uv.lock ./

# Instalar dependencias
RUN uv sync --no-dev

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando por defecto
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
