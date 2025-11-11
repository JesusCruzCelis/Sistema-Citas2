import { useEffect, useState } from "react";
import { usuariosAPI } from "../services/api";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [formData, setFormData] = useState({
    Nombre: "",
    Apellido_Paterno: "",
    Apellido_Materno: "",
    Email: "",
    Rol: "",
    Rol_Escuela: "",
    Area: "",
    Password: ""
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosAPI.getAll();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/universidad/usuarios/search/id/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener detalles del usuario');
      }
      
      const data = await response.json();
      setUsuarioDetalle(data);
      setMostrarDetalles(true);
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const abrirModalEdicion = async (usuario) => {
    try {
      // Obtener detalles completos del usuario
      const response = await fetch(
        `http://localhost:8000/universidad/usuarios/search/id/${usuario.Id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener detalles del usuario');
      }
      
      const data = await response.json();
      
      setUsuarioSeleccionado(usuario);
      setFormData({
        Nombre: data.Nombre || "",
        Apellido_Paterno: data.Apellido_Paterno || "",
        Apellido_Materno: data.Apellido_Materno || "",
        Email: data.Email || "",
        Rol: data.Rol || "",
        Rol_Escuela: data.Rol_Escuela || "",
        Area: data.Area || "",
        Password: ""
      });
      setMostrarModal(true);
    } catch (err) {
      console.error("Error al cargar usuario para edición:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioSeleccionado(null);
    setFormData({
      Nombre: "",
      Apellido_Paterno: "",
      Apellido_Materno: "",
      Email: "",
      Rol: "",
      Rol_Escuela: "",
      Area: "",
      Password: ""
    });
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setUsuarioDetalle(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const actualizarUsuario = async (e) => {
    e.preventDefault();
    
    try {
      // Solo enviar campos que no estén vacíos
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].trim() !== "") {
          dataToSend[key] = formData[key];
        }
      });

      await usuariosAPI.update(usuarioSeleccionado.Id, dataToSend);
      alert("Usuario actualizado correctamente.");
      cerrarModal();
      cargarUsuarios(); // Recargar la lista
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      alert(`No se pudo actualizar el usuario:\n${err.message}`);
    }
  };

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      await usuariosAPI.delete(id);
      alert("Usuario eliminado correctamente.");
      cargarUsuarios(); // Recargar la lista
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert(`No se pudo eliminar el usuario:\n${err.message}`);
    }
  };

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
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Nombre Completo</th>
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
                <td className="px-4 py-2">
                  {u.Nombre} {u.Apellido_Paterno} {u.Apellido_Materno}
                </td>
                <td className="px-4 py-2">{u.Area}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => verDetalles(u.Id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => abrirModalEdicion(u)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarUsuario(u.Id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      {mostrarDetalles && usuarioDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detalles del Usuario</h3>
              <button
                onClick={cerrarDetalles}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{usuarioDetalle.Id}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{usuarioDetalle.Nombre}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Apellido Paterno</p>
                <p className="font-medium">{usuarioDetalle.Apellido_Paterno}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Apellido Materno</p>
                <p className="font-medium">{usuarioDetalle.Apellido_Materno}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{usuarioDetalle.Email}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Rol</p>
                <p className="font-medium">{usuarioDetalle.Rol}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Rol Escuela</p>
                <p className="font-medium">{usuarioDetalle.Rol_Escuela}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Área</p>
                <p className="font-medium">{usuarioDetalle.Area}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={cerrarDetalles}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Editar Usuario</h3>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={actualizarUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="Nombre"
                  value={formData.Nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dejar vacío para no modificar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  name="Apellido_Paterno"
                  value={formData.Apellido_Paterno}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dejar vacío para no modificar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="Apellido_Materno"
                  value={formData.Apellido_Materno}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dejar vacío para no modificar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dejar vacío para no modificar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  name="Rol"
                  value={formData.Rol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Rol</option>
                  <option value="admin_sistema">Admin Sistema</option>
                  <option value="admin_escuela">Admin Escuela</option>
                  <option value="vigilancia">Vigilancia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol Escuela
                </label>
                <select
                  name="Rol_Escuela"
                  value={formData.Rol_Escuela}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Rol en la Escuela</option>
                  <option value="Rector">Rector</option>
                  <option value="Director">Director</option>
                  <option value="Subdirector">Subdirector</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Docente">Docente</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Asistente">Asistente</option>
                  <option value="Vigilante">Vigilante</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área
                </label>
                <select
                  name="Area"
                  value={formData.Area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Área</option>
                  <option value="Rectoría">Rectoría</option>
                  <option value="Dirección académica">Dirección académica</option>
                  <option value="Servicios escolares">Servicios escolares</option>
                  <option value="Administación y Finanzas">Administación y Finanzas</option>
                  <option value="Tecnologías de la información y comunicaciones">
                    Tecnologías de la información y comunicaciones
                  </option>
                  <option value="Comunicación institucional">Comunicación institucional</option>
                  <option value="Formación y bienestar universitario">
                    Formación y bienestar universitario
                  </option>
                  <option value="Extensión universitaria">Extensión universitaria</option>
                  <option value="Orientación y desarrollo">Orientación y desarrollo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña (opcional)
                </label>
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dejar vacío para mantener la actual"
                  minLength="8"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres. Dejar vacío para no cambiar la contraseña.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
