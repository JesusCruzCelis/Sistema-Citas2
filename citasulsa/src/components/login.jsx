import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const rol = prompt(
      "Ingresa tu rol: admin_sistema, admin_universitario o guardia"
    );

    if (
      rol === "admin_sistema" ||
      rol === "admin_universitario" ||
      rol === "guardia"
    ) {
      localStorage.setItem("rol", rol); // guardamos el rol del usuario
      navigate("/bienvda"); // redirige después del login
    } else {
      alert(
        "Rol inválido. Intenta con admin_sistema, admin_universitario o guardia."
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-200 justify-center items-center">
      <div className="flex w-[900px] h-[500px] bg-white shadow-lg rounded-lg overflow-hidden border border-blue-300">
        {/* Sección Izquierda - Imagen */}
        <div className="w-1/2 relative">
          <img
            src="/f.jpg"
            alt="Login background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/70"></div>
        </div>

        {/* Sección Derecha - Formulario */}
        <div className="w-1/2 bg-blue-900 flex flex-col justify-center px-12 text-white">
          <h2 className="text-2xl font-semibold mb-8 text-center drop-shadow-lg">
            INICIAR SESIÓN
          </h2>

          {/* Usuario */}
          <div className="mb-6">
            <label className="block text-sm mb-2">Usuario</label>
            <div className="flex items-center bg-blue-950/60 rounded-md shadow-md px-4 py-3">
              <UserIcon className="h-5 w-5 mr-2 text-gray-300" />
              <input
                type="text"
                placeholder="Usuario"
                className="bg-transparent outline-none w-full placeholder-gray-300"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="mb-8">
            <label className="block text-sm mb-2">Contraseña</label>
            <div className="flex items-center bg-blue-950/60 rounded-md shadow-md px-4 py-3">
              <LockClosedIcon className="h-5 w-5 mr-2 text-gray-300" />
              <input
                type="password"
                placeholder="Contraseña"
                className="bg-transparent outline-none w-full placeholder-gray-300"
              />
            </div>
          </div>

          {/* Botón */}
          <button
            onClick={handleLogin}
            className="bg-blue-800 hover:bg-blue-700 w-full py-2 rounded-md shadow-md font-semibold transition"
          >
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}
