import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  BookOpenIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  MapPinIcon,
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

  // 🔹 Si es vigilancia o guardia, quitar "Agendar" 
  if (rol === "vigilancia" || rol === "guardia") {
    baseMenu = baseMenu.filter((item) => item.name !== "Agendar");
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
        name: "Horarios Coordinadores",
        icon: <ClockIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/gestionar-horarios",
      },
      {
        name: "Horarios de Áreas",
        icon: <MapPinIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/gestionar-horarios-areas",
      }
    ];
  } else if (rol === "admin_escuela") {
    // admin_escuela solo puede agendar y consultar (sin menús adicionales)
    extraMenu = [];
  } else if (rol === "admin_universitario") {
    extraMenu = [
      {
        name: "Agregar",
        icon: <PlusIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/calendario",
      },
    ];
  } else if (rol === "vigilancia" || rol === "guardia") {
    // vigilancia/guardia solo puede consultar (sin menús adicionales)
    extraMenu = [];
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
