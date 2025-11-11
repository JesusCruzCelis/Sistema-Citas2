import React, { useState } from "react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdmin({ ...admin, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Administrador agregado:", admin);
    alert("Administrador agregado correctamente ✅");
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
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Agregar Administrador
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombres */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Nombres
            </label>
            <input
              type="text"
              name="nombres"
              value={admin.nombres}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. Camila Johana"
            />
          </div>

          {/* Apellidos pat y mat */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Apellido Paterno
            </label>
            <input
              type="text"
              name="apellidos"
              value={admin.apellidopat}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. Marcial"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Apellido Materno
            </label>
            <input
              type="text"
              name="apellidos"
              value={admin.apellidomat}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej. Marcial"
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
            </label>
            <input
              type="password"
              name="password"
              value={admin.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="********"
            />
          </div>
          {/* ROL */}

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Rol
            </label>
            <input
              type="text"
              name="rol"
              value={admin.rol}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Rol"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Rol en la escuela
            </label>
            <input
              type="text"
              name="rol_escuela"
              value={admin.rol_escuela}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Rol"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Agregar Administrador
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
