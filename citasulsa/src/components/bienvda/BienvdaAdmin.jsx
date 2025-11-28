import {
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import WelcomeCard from "../shared/WelcomeCard";

export default function BienvdaAdmin() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Usar nombre_completo si existe, o construirlo de las partes
        const nombreCompleto = payload.nombre_completo || 
                              `${payload.nombre || ''} ${payload.apellido_paterno || ''} ${payload.apellido_materno || ''}`.trim() ||
                              "Usuario";
        setNombreUsuario(nombreCompleto);
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      setNombreUsuario("Usuario");
    }
  }, []);

  return (
    <main className="flex-1 p-12 bg-[#f9fafb] rounded-tl-2xl shadow-inner min-h-screen flex flex-col items-center justify-center font-[Mitr]">
      {/* Tarjeta de bienvenida */}
      <WelcomeCard nombreUsuario={nombreUsuario} tipoUsuario="admin_sistema" />

      {/* Cuadros de acción */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-center">
        {/* Administrar Usuarios */}
        <div
          onClick={() => navigate("/admin")}
          className="bg-[#e0e7ff] hover:bg-[#c7d2fe] shadow-md rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300"
        >
          <UserGroupIcon className="w-10 h-10 mx-auto text-[#1e3a8a]" />
          <p className="mt-2 text-[#1e3a8a]">Administrar Usuarios</p>
        </div>

        {/* Consultar Usuarios */}
        <div
          onClick={() => navigate("/consultar-usuario")}
          className="bg-[#e0e7ff] hover:bg-[#c7d2fe] shadow-md rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300"
        >
          <UserGroupIcon className="w-10 h-10 mx-auto text-[#1e3a8a]" />
          <p className="mt-2 text-[#1e3a8a]">Consultar Usuarios</p>
        </div>

        {/* Gestionar Horarios */}
        <div
          onClick={() => navigate("/gestionar-horarios")}
          className="bg-[#e0e7ff] hover:bg-[#c7d2fe] shadow-md rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300"
        >
          <ClockIcon className="w-10 h-10 mx-auto text-[#1e3a8a]" />
          <p className="mt-2 text-[#1e3a8a]">Gestionar Horarios</p>
        </div>
      </div>
    </main>
  );
}
