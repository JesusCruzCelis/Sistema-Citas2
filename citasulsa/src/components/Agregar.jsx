import { useState } from "react";

export default function Agregar({ visitantes, setVisitantes }) {
  const [formData, setFormData] = useState({
    nombre: "",
    genero: "",
    fechaNacimiento: "",
    ine: "",
    correo: "",
    celular: "",
    fechaCita: "",
    horaCita: "",
    area: "",
    persona: "",
    medio: "A pie",
    marca: "",
    modelo: "",
    color: "",
    placas: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación mínima
    if (!formData.nombre || !formData.fechaCita || !formData.horaCita) {
      alert(
        "⚠️ Por favor completa los campos obligatorios (nombre, fecha y hora de cita)"
      );
      return;
    }

    // Agregar al estado global
    const nuevoRegistro = { ...formData, id: Date.now() };
    const nuevosVisitantes = [...visitantes, nuevoRegistro];
    setVisitantes(nuevosVisitantes);

    // Guardar en localStorage para persistencia
    localStorage.setItem("visitas", JSON.stringify(nuevosVisitantes));

    alert("✅ Registro guardado correctamente");

    // Limpiar formulario
    setFormData({
      nombre: "",
      genero: "",
      fechaNacimiento: "",
      ine: "",
      correo: "",
      celular: "",
      fechaCita: "",
      horaCita: "",
      area: "",
      persona: "",
      medio: "A pie",
      marca: "",
      modelo: "",
      color: "",
      placas: "",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 mt-6 space-y-6"
      >
        {/* --- DATOS PERSONALES --- */}
        <section>
          <h2 className="text-xl  text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Datos personales de la visita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />

            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            >
              <option value="">Género</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>

            <div>
              <label className="block text-sm text-gray-600">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              />
            </div>

            <input
              type="text"
              name="ine"
              placeholder="INE"
              value={formData.ine}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />

            <input
              type="tel"
              name="celular"
              placeholder="Número de celular"
              value={formData.celular}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />
          </div>
        </section>

        {/* --- DATOS DE LA CITA --- */}
        <section>
          <h2 className="text-xl text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Datos de la cita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">
                Fecha de la cita
              </label>
              <input
                type="date"
                name="fechaCita"
                value={formData.fechaCita}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">
                Hora de la cita
              </label>
              <input
                type="time"
                name="horaCita"
                value={formData.horaCita}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              />
            </div>

            <input
              type="text"
              name="area"
              placeholder="Área o departamento visitado"
              value={formData.area}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />

            <input
              type="text"
              name="persona"
              placeholder="Persona a quien se visita"
              value={formData.persona}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />
          </div>
        </section>

        {/* --- MEDIO DE INGRESO --- */}
        <section>
          <h2 className="text-xl  text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Medio de ingreso
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="medio"
                  value="A pie"
                  checked={formData.medio === "A pie"}
                  onChange={handleChange}
                />
                <span>A pie</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="medio"
                  value="En vehículo"
                  checked={formData.medio === "En vehículo"}
                  onChange={handleChange}
                />
                <span>En vehículo</span>
              </label>
            </div>

            {formData.medio === "En vehículo" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  name="marca"
                  placeholder="Marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
                <input
                  type="text"
                  name="modelo"
                  placeholder="Modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
                <input
                  type="text"
                  name="color"
                  placeholder="Color"
                  value={formData.color}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
                <input
                  type="text"
                  name="placas"
                  placeholder="Placas"
                  value={formData.placas}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
              </div>
            )}
          </div>
        </section>

        {/* --- BOTÓN DE ENVÍO --- */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1a237e] text-white px-6 py-2 rounded-md hover:bg-[#303f9f] transition font-[Mitr]"
          >
            Registrar
          </button>
        </div>
      </form>
    </div>
  );
}
