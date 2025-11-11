import React, { useState } from "react";
import { usuariosAPI } from "../services/api";

const AddAdmin = () => {
  const [admin, setAdmin] = useState({
    nombres: "",
    apellidopat: "",
    apellidomat: "",
    fechaNacimiento: "",
    correo: "",
    telefono: "",
    area: "",
    password: "",
    rol: "",
    rol_escuela: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdmin({ ...admin, [name]: value });
    setError(""); // Limpiar errores al escribir
    setSuccess(""); // Limpiar mensaje de éxito
  };

  const validateForm = () => {
    // Validar nombres
    if (admin.nombres.trim().length < 2) {
      setError("❌ El nombre debe tener al menos 2 caracteres");
      return false;
    }

    // Validar apellidos
    if (admin.apellidopat.trim().length < 2) {
      setError("❌ El apellido paterno debe tener al menos 2 caracteres");
      return false;
    }

    if (admin.apellidomat.trim().length < 2) {
      setError("❌ El apellido materno debe tener al menos 2 caracteres");
      return false;
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(admin.correo)) {
      setError("❌ El correo electrónico no es válido");
      return false;
    }

    // Validar contraseña
    if (admin.password.length < 8) {
      setError("❌ La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    if (admin.password.includes(" ")) {
      setError("❌ La contraseña no puede contener espacios");
      return false;
    }

    // Validar selección de rol
    if (!admin.rol) {
      setError("❌ Debes seleccionar un rol del sistema");
      return false;
    }

    if (!admin.rol_escuela) {
      setError("❌ Debes seleccionar un rol en la escuela");
      return false;
    }

    // Validar área
    if (!admin.area) {
      setError("❌ Debes seleccionar un área");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para el backend
      const usuarioData = {
        Nombre: admin.nombres.trim(),
        Apellido_Paterno: admin.apellidopat.trim(),
        Apellido_Materno: admin.apellidomat.trim(),
        Email: admin.correo.trim().toLowerCase(),
        Password: admin.password,
        Rol: admin.rol,
        Rol_Escuela: admin.rol_escuela,
        Area: admin.area,
      };

      await usuariosAPI.create(usuarioData);
      
      setSuccess("✅ Usuario agregado correctamente");
      
      // Limpiar formulario después de 1 segundo
      setTimeout(() => {
        setAdmin({
          nombres: "",
          apellidopat: "",
          apellidomat: "",
          fechaNacimiento: "",
          correo: "",
          telefono: "",
          area: "",
          password: "",
          rol: "",
          rol_escuela: "",
        });
        setSuccess("");
      }, 2000);
      
    } catch (err) {
      console.error("Error al agregar usuario:", err);
      
      // Mensajes de error personalizados
      let errorMessage = err.message;
      
      if (errorMessage.includes("correo") || errorMessage.includes("Email") || errorMessage.includes("email")) {
        setError("❌ Este correo electrónico ya está registrado. Por favor usa otro.");
      } else if (errorMessage.includes("duplicate") || errorMessage.includes("duplicado")) {
        setError("❌ Ya existe un usuario con estos datos.");
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        setError("❌ Error de conexión. Verifica que el servidor esté funcionando.");
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        setError("❌ No tienes permisos para realizar esta acción.");
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError("❌ Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      } else {
        setError(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Agregar Usuario
        </h2>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
            <span className="text-xl mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-start">
            <span className="text-xl mr-2">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombres */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Nombre(s)
            </label>
            <input
              type="text"
              name="nombres"
              value={admin.nombres}
              onChange={handleChange}
              required
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. Juan Carlos"
              title="Solo letras y espacios"
            />
          </div>

          {/* Apellidos pat y mat */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Apellido Paterno
            </label>
            <input
              type="text"
              name="apellidopat"
              value={admin.apellidopat}
              onChange={handleChange}
              required
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. García"
              title="Solo letras y espacios"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Apellido Materno
            </label>
            <input
              type="text"
              name="apellidomat"
              value={admin.apellidomat}
              onChange={handleChange}
              required
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. Martínez"
              title="Solo letras y espacios"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={admin.correo}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. admin@empresa.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={admin.telefono}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. 9511234567"
            />
          </div>

          {/* Área */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Área
            </label>
            <select
              name="area"
              value={admin.area}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seleccione un área</option>
              <option value="Rectoría">Rectoría</option>
              <option value="Dirección académica">Dirección académica</option>
              <option value="Servicios escolares">Servicios escolares</option>
              <option value="Administación y Finanzas">
                Administación y Finanzas
              </option>
              <option value="Tecnologías de la información y comunicaciones">
                Tecnologías de la información y comunicaciones
              </option>
              <option value="Comunicación institucional">
                Comunicación institucional
              </option>
              <option value="Formación y bienestar universitario">
                Formación y bienestar universitario
              </option>
              <option value="Extensión universitaria">
                Extensión universitaria
              </option>
              <option value="Orientación y desarrollo">
                Orientación y desarrollo
              </option>
            </select>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Contraseña
              <span className="text-xs text-gray-500 ml-2">(mínimo 8 caracteres, una mayúscula, con un caracter especial, sin espacios)</span>
            </label>
            <input
              type="password"
              name="password"
              value={admin.password}
              onChange={handleChange}
              required
              minLength="8"
              maxLength="100"
              pattern="[^\s]+"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Mínimo 8 caracteres"
              title="Mínimo 8 caracteres, sin espacios"
            />
          </div>
          {/* ROL */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Rol en el Sistema
            </label>
            <select
              name="rol"
              value={admin.rol}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seleccione un rol</option>
              <option value="admin_sistema">Administrador del Sistema</option>
              <option value="admin_escuela">Administrador de Escuela</option>
              <option value="vigilancia">Vigilancia</option>
            </select>
          </div>

          {/* ROL EN LA ESCUELA */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Rol en la Escuela
            </label>
            <select
              name="rol_escuela"
              value={admin.rol_escuela}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seleccione un rol</option>
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

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Agregar Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
