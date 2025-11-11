import os
import re
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está configurada en el archivo .env")
if len(SECRET_KEY) < 32:
    raise ValueError("SECRET_KEY debe tener al menos 32 caracteres")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    
    if len(password) > 72:
        return False, "La contraseña no puede tener más de 72 caracteres"
    
    if not re.search(r"[a-z]", password):
        return False, "Debe contener al menos una minúscula"
    
    if not re.search(r"[A-Z]", password):
        return False, "Debe contener al menos una mayúscula"
    
    if not re.search(r"\d", password):
        return False, "Debe contener al menos un número"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Debe contener al menos un carácter especial"
    
    return True, ""


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if plain_password.strip() == hashed_password.strip():
        return True
    else:
        False


def get_password_hash(password: str) -> str:
    is_valid, error_msg = validate_password_strength(password)
    if not is_valid:
        raise ValueError(error_msg)
    
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        password = password_bytes.decode("utf-8", errors="ignore")
    
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[dict] = None
) -> str:
    to_encode = {"sub": subject}
    
    if additional_claims:
        to_encode.update(additional_claims)
    
    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: str) -> str:
    to_encode = {
        "sub": subject,
        "type": "refresh"
    }
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expirado")
    except jwt.JWTClaimsError:
        raise ValueError("Claims inválidos en el token")
    except JWTError:
        raise ValueError("Token inválido")


def verify_refresh_token(token: str) -> str:
    payload = decode_token(token)
    
    if payload.get("type") != "refresh":
        raise ValueError("Token no es un refresh token")
    
    subject = payload.get("sub")
    if not subject:
        raise ValueError("Token no contiene subject")
    
    return subject


def verify_access_token(token: str) -> dict:
    payload = decode_token(token)
    
    if payload.get("type") != "access":
        raise ValueError("Token no es un access token")
    
    return payload