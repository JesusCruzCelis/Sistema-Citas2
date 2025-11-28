import asyncio
import asyncpg
from dotenv import load_dotenv
import os
from passlib.context import CryptContext
import uuid

# Cargar variables de entorno
load_dotenv()

# Configuración de encriptación
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def crear_admin_sistema():
    # Configuración de la base de datos
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "SistemaPrueba")
    DB_USER = os.getenv("DB_USER", "barrita")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "12345")
    
    # Datos del administrador
    email = "minicoopsito7@gmail.com"
    password = "Admin123@"
    nombre = "Administrador"
    apellido_paterno = "Sistema"
    apellido_materno = "Principal"
    rol = "admin_sistema"
    
    # Encriptar contraseña
    hashed_password = pwd_context.hash(password)
    
    print("🔄 Conectando a la base de datos...")
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        print("✅ Conexión establecida")
        
        # Verificar si el usuario ya existe
        existing_user = await conn.fetchrow(
            'SELECT * FROM usuarios WHERE "Email" = $1',
            email
        )
        
        if existing_user:
            print(f"⚠️  El usuario con email {email} ya existe en la base de datos")
            print(f"   ID: {existing_user['Id']}")
            print(f"   Nombre: {existing_user['Nombre']} {existing_user['Apellido_Paterno']}")
            print(f"   Rol: {existing_user['Rol']}")
            
            # Preguntar si desea actualizar la contraseña
            respuesta = input("\n¿Deseas actualizar la contraseña? (s/n): ")
            if respuesta.lower() == 's':
                await conn.execute(
                    'UPDATE usuarios SET "Password" = $1 WHERE "Email" = $2',
                    hashed_password, email
                )
                print(f"✅ Contraseña actualizada para {email}")
        else:
            # Generar UUID para el nuevo usuario
            user_id = uuid.uuid4()
            
            # Insertar nuevo usuario (Rol_Escuela y Area vacíos para admin_sistema)
            await conn.execute("""
                INSERT INTO usuarios ("Id", "Nombre", "Apellido_Paterno", "Apellido_Materno", "Password", "Email", "Rol", "Rol_Escuela", "Area")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """, user_id, nombre, apellido_paterno, apellido_materno, hashed_password, email, rol, "", "Sistema")
            
            print(f"✅ Administrador del sistema creado exitosamente")
            print(f"   Email: {email}")
            print(f"   Contraseña: {password}")
            print(f"   Rol: {rol}")
        
        # Cerrar conexión
        await conn.close()
        print("\n✅ Proceso completado")
        
    except asyncpg.exceptions.InvalidPasswordError:
        print("❌ Error: Contraseña de base de datos incorrecta")
    except asyncpg.exceptions.InvalidCatalogNameError:
        print(f"❌ Error: La base de datos '{DB_NAME}' no existe")
    except Exception as e:
        print(f"❌ Error al crear administrador: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("CREAR ADMINISTRADOR DEL SISTEMA")
    print("=" * 60)
    asyncio.run(crear_admin_sistema())
