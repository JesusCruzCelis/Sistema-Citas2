import { Link, useLocation } from "react-router-dom";
import {
  PlusIcon,
  BookOpenIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/20/solid";

export default function Navbar() {
  const location = useLocation();
  const rol = localStorage.getItem("rol"); // Leemos el rol guardado

  // 🔹 Menús base (todos los usuarios)
  const baseMenu = [
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

  // 🔹 Menús adicionales según el rol
  let extraMenu = [];

  if (rol === "admin_sistema") {
    extraMenu = [
      {
        name: "Administrar Usuarios",
        icon: <UserGroupIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/admin",
      },
    ];
  } else if (rol === "admin_universitario") {
    extraMenu = [
      {
        name: "Agregar",
        icon: <PlusIconIcon className="w-5 h-5 font-[Mitr]" />,
        path: "/calendario",
      },
    ];
  } else if (rol === "guardia") {
    // Los guardias solo pueden consultar → quitamos todo menos "Consultar" y "Home"
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
    </aside>
  );
}
