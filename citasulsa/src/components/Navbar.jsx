import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  BookOpenIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/20/solid";
import { authAPI } from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol"); // Leemos el rol guardado

  // 🔹 Función para cerrar sesión
  const handleLogout = () => {
    authAPI.logout();
    navigate("/");
  };

  // 🔹 Menús base (todos los usuarios)
  let baseMenu = [
    {
      name: "Home",
      icon: <HomeIcon className="w-5 h-5 font-[Mitr]" />,
      path: "/bienvda",
    },
    {
      name: "Agendar",
      icon: <PlusIcon className="w-5 h-5 font-[Mitr]" />,
      path: "/agregar",
    },
    {
      name: "Consultar",
      icon: <BookOpenIcon className="w-5 h-5 font-[Mitr]" />,
      path: "/consultar",
    },
  ];

  // 🔹 Si es admin_sistema, quitar "Agendar" y "Consultar"
  if (rol === "admin_sistema") {
    baseMenu = baseMenu.filter((item) => item.name !== "Agendar" && item.name !== "Consultar");
  }

  // 🔹 Menús adicionales según el rol
  let extraMenu = [];

  if (rol === "admin_sistema") {
    extraMenu = [
      {
        name: "Agregar Usuarios",
        icon: <UserGroupIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/admin",
      },
      {
        name: "Consultar Usuarios",
        icon: <UserGroupIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/consultar-usuario",
      },
      {
        name: "Gestionar Horarios",
        icon: <ClockIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/gestionar-horarios",
      }
    ];
  } else if (rol === "admin_universitario") {
    extraMenu = [
      {
        name: "Agregar",
        icon: <PlusIconIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/calendario",
      },
    ];
  } else if (rol === "vigilancia" || rol === "guardia") {
    // Los guardias/vigilancia solo pueden consultar → quitamos todo menos "Consultar" y "Home"
    return (
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col fixed h-screen shadow-lg">
        <div className="flex flex-col items-center justify-center bg-white py-6">
          <img src="/logo.jpg" alt="Logo La Salle" className="h-24" />
        </div>

        <nav className="flex flex-col mt-6 space-y-3 pl-6 pr-4">
          {baseMenu
            .filter((item) => item.name === "Home" || item.name === "Consultar")
            .map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-white text-[#1e3a8a] font-semibold"
                    : "hover:bg-[#243c96]"
                }`}
              >
                {item.icon}
                <span className="text-md">{item.name}</span>
              </Link>
            ))}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="mt-auto mb-6 px-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-3 px-3 w-full rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="text-md font-[Mitr]">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    );
  }

  // 🔹 Combina los menús base + extras
  const menuItems = [...baseMenu, ...extraMenu];

  return (
    <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col fixed h-screen shadow-lg">
      <div className="flex flex-col items-center justify-center bg-white py-6">
        <img src="/logo.jpg" alt="Logo La Salle" className="h-24" />
      </div>

      <nav className="flex flex-col mt-6 space-y-3 pl-6 pr-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-white text-[#1e3a8a] font-semibold"
                : "hover:bg-[#243c96]"
            }`}
          >
            {item.icon}
            <span className="text-md">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* 🔹 Botón de Logout */}
      <div className="mt-auto mb-6 pl-6 pr-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 py-3 px-3 w-full rounded-xl transition-all duration-200 hover:bg-red-600 bg-red-500"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="text-md">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
