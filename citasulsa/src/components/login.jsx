import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // Limpiar error al escribir
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData.email, formData.password);
      console.log("Login exitoso:", response);
      navigate("/bienvda");
    } catch (err) {
      console.error("Error en login:", err);
      
      // Mensajes de error personalizados
      let errorMessage = "Error al iniciar sesión. Por favor, intenta de nuevo.";
      
      if (err.message) {
        const msg = err.message.toLowerCase();
        
        if (msg.includes("usuario no encontrado") || msg.includes("no encontrado")) {
          errorMessage = "❌ Usuario no encontrado. Verifica tu correo electrónico.";
        } else if (msg.includes("contraseña incorrecta") || msg.includes("password")) {
          errorMessage = "❌ Contraseña incorrecta. Por favor, inténtalo de nuevo.";
        } else if (msg.includes("correo electrónico o contraseña incorrectos")) {
          errorMessage = "❌ Correo electrónico o contraseña incorrectos.";
        } else if (msg.includes("sesión ha expirado")) {
          errorMessage = "⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
        } else if (msg.includes("no estás autenticado")) {
          errorMessage = "⚠️ Debes iniciar sesión para continuar.";
        } else if (msg.includes("error interno") || msg.includes("500")) {
          errorMessage = "⚠️ Error del servidor. Por favor, intenta más tarde.";
        } else if (msg.includes("red") || msg.includes("network") || msg.includes("fetch")) {
          errorMessage = "⚠️ Error de conexión. Verifica tu conexión a internet.";
        } else {
          // Si hay un mensaje específico del servidor, mostrarlo
          errorMessage = `❌ ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
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

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm mb-2">Email</label>
              <div className="flex items-center bg-blue-950/60 rounded-md shadow-md px-4 py-3">
                <UserIcon className="h-5 w-5 mr-2 text-gray-300" />
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-transparent outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Contraseña</label>
              <div className="flex items-center bg-blue-950/60 rounded-md shadow-md px-4 py-3">
                <LockClosedIcon className="h-5 w-5 mr-2 text-gray-300" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-transparent outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-md text-sm">
                <div className="flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-700 w-full py-2 rounded-md shadow-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
