import { useEffect, useState } from "react";
import { usuariosAPI } from "../services/api";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await usuariosAPI.getAll();
        setUsuarios(data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      await usuariosAPI.delete(id);
      alert("Usuario eliminado correctamente.");
      window.location.reload(); // 🔹 Recarga toda la página y vuelve a cargar desde la BD
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert(`No se pudo eliminar el usuario:\n${err.message}`);
    }
  };

  if (usuarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No hay usuarios registrados.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Usuarios Registrados
      </h2>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Apellido Paterno</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Apellido Materno</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Área</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <td className="px-4 py-2">{u.Nombre}</td>
                <td className="px-4 py-2">{u.Apellido_Paterno}</td>
                <td className="px-4 py-2">{u.Apellido_Materno}</td>
                <td className="px-4 py-2">{u.Area}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => eliminarUsuario(u.Id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
