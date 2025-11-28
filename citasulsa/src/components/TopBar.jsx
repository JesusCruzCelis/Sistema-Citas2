import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔹 Eliminar datos de sesión (usuario, rol, token, etc.)

    // 🔹 Redirigir al login
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-[#1e3a8a] flex items-center justify-between px-6 shadow-md z-30 font-[Mitr]">
      <h1 className="text-white text-lg tracking-wide">Sistema de Citas</h1>     
    </header>
  );
}
