from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os
from dotenv import load_dotenv

load_dotenv()
Base = declarative_base()

DATABASE_URL = os.getenv("DATABASE_URL")



engine = create_async_engine(
    DATABASE_URL,
    future=True
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False, 
    class_=AsyncSession
)


