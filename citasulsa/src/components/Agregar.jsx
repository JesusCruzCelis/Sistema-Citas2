import { useState } from "react";
import { visitantesAPI, carrosAPI, citasAPI } from "../services/api";

export default function Agregar({ visitantes, setVisitantes }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "",
    fechaNacimiento: "",
    ine: "",
    correo: "",
    celular: "",
    fechaCita: "",
    horaCita: "",
    personaVisitar: "",  // Un solo campo de texto libre
    area: "",
    medio: "A pie",
    marca: "",
    modelo: "",
    color: "",
    placas: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones en tiempo real
    let processedValue = value;
    
    // Para INE: solo números, máximo 10 dígitos
    if (name === 'ine') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Para celular: solo números, máximo 10 dígitos
    if (name === 'celular') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Para placas: sin espacios, máximo 12 caracteres, alfanumérico
    if (name === 'placas') {
      processedValue = value.replace(/\s/g, '').toUpperCase().slice(0, 12);
    }
    
    // Para nombres: solo letras y espacios
    if (['nombre', 'apellidoPaterno', 'apellidoMaterno', 'personaVisitar'].includes(name)) {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    }
    
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.nombre || !formData.apellidoPaterno || !formData.fechaCita || !formData.horaCita) {
      alert(
        "⚠️ Por favor completa los campos obligatorios:\n• Nombre del visitante\n• Apellido paterno del visitante\n• Fecha de cita\n• Hora de cita"
      );
      return;
    }

    if (!formData.area || !formData.area.trim()) {
      alert("⚠️ Por favor ingresa el área a visitar (ej: Rectoría, Sistemas, Biblioteca)");
      return;
    }

    // Validación de INE: 10 dígitos exactos
    if (formData.ine && formData.ine.length !== 10) {
      alert("⚠️ El INE debe tener exactamente 10 dígitos numéricos");
      return;
    }

    // Validación de celular: 10 dígitos exactos
    if (formData.celular && formData.celular.length !== 10) {
      alert("⚠️ El número de celular debe tener exactamente 10 dígitos");
      return;
    }

    // Validar correo electrónico
    if (formData.correo && formData.correo.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        alert("⚠️ Por favor ingresa un correo electrónico válido");
        return;
      }
    }

    // Validar que si viene en vehículo, tenga placas
    if (formData.medio === "En vehículo") {
      if (!formData.placas) {
        alert("⚠️ Si el visitante viene en vehículo, debes ingresar las placas del mismo.");
        return;
      }
      if (formData.placas.length < 5 || formData.placas.length > 12) {
        alert("⚠️ Las placas deben tener entre 5 y 12 caracteres");
        return;
      }
    }

    // Validar fecha no sea pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(formData.fechaCita);
    if (fechaSeleccionada < hoy) {
      alert("⚠️ La fecha de la cita no puede ser anterior a hoy");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear visitante
      const visitanteData = {
        Nombre: formData.nombre,
        Apellido_Paterno: formData.apellidoPaterno,
        Apellido_Materno: formData.apellidoMaterno || "",
        Genero: formData.genero || "NoEspecificado",
        Fecha_Nacimiento: formData.fechaNacimiento || null,
        Ine: formData.ine || "",
        Correo: formData.correo || "",
        Numero: formData.celular || "",
        Ingreso: formData.medio === "En vehículo" ? "Vehiculo" : "Pie"
      };

      await visitantesAPI.create(visitanteData);
      console.log("✅ Visitante creado");

      // 2. Si viene en vehículo, crear el carro
      if (formData.medio === "En vehículo" && formData.placas) {
        const carroData = {
          marca: formData.marca || "NoEspecificada",
          modelo: formData.modelo || "NoEspecificado",
          color: formData.color || "NoEspecificado",
          placas: formData.placas
        };

        await carrosAPI.create(carroData);
        console.log("✅ Carro creado");
      }

      // 3. Crear la cita
      // Nota: El personal visitado es OPCIONAL y no necesita estar registrado en el sistema
      const citaData = {
        Nombre_Persona_Visitada: formData.personaVisitar?.trim() || null,
        Nombre_Visitante: formData.nombre,
        Apellido_Paterno_Visitante: formData.apellidoPaterno,
        Apellido_Materno_Visitante: formData.apellidoMaterno || "",
        Placas: (formData.medio === "En vehículo" && formData.placas) ? formData.placas : null,
        Fecha: formData.fechaCita,
        Hora: formData.horaCita,
        Area: formData.area
      };

      await citasAPI.create(citaData);
      console.log("✅ Cita creada");

      // Actualizar el estado local si es necesario
      const nuevoRegistro = { ...formData, id: Date.now() };
      const nuevosVisitantes = [...visitantes, nuevoRegistro];
      setVisitantes(nuevosVisitantes);
      localStorage.setItem("visitas", JSON.stringify(nuevosVisitantes));

      alert("✅ Cita registrada correctamente en la base de datos");

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        genero: "",
        fechaNacimiento: "",
        ine: "",
        correo: "",
        celular: "",
        fechaCita: "",
        horaCita: "",
        personaVisitar: "",
        area: "",
        medio: "A pie",
        marca: "",
        modelo: "",
        color: "",
        placas: "",
      });
    } catch (error) {
      console.error("❌ Error al registrar la cita:", error);
      
      // Mensajes de error más amigables
      let errorMessage = error.message;
      
      // Error de personal del sistema no encontrado
      if (errorMessage.includes("Personal del sistema no encontrado") || 
          errorMessage.includes("Usuario no encontrado")) {
        errorMessage = `⚠️ Error al procesar la información de la persona a visitar. Por favor intenta de nuevo.`;
      }
      // Error de visitante no encontrado
      else if (errorMessage.includes("Visitante no encontrado")) {
        errorMessage = "⚠️ Hubo un problema al crear el registro del visitante. Por favor, intenta de nuevo.";
      }
      // Error de campos requeridos
      else if (errorMessage.includes("Field required")) {
        errorMessage = "⚠️ Por favor, completa todos los campos obligatorios del formulario.";
      }
      // Error de validación
      else if (errorMessage.includes("Value error")) {
        const errorDetail = errorMessage.split("Value error,")[1] || errorMessage;
        if (errorDetail.includes("INE")) {
          errorMessage = "⚠️ El INE debe tener exactamente 10 dígitos numéricos";
        } else if (errorDetail.includes("número telefónico")) {
          errorMessage = "⚠️ El número de celular debe tener exactamente 10 dígitos";
        } else if (errorDetail.includes("espacios")) {
          errorMessage = `⚠️ Error de validación: Hay campos que no deben contener espacios en blanco`;
        } else {
          errorMessage = `⚠️ Error de validación: ${errorDetail.trim()}`;
        }
      }
      // Error de autenticación
      else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || 
               errorMessage.includes("sesión ha expirado") || errorMessage.includes("Token expirado")) {
        errorMessage = "🔒 Tu sesión ha expirado. Por favor, inicia sesión nuevamente.\n\nSerás redirigido al inicio de sesión en un momento...";
      }
      // Error de permisos
      else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        errorMessage = "⚠️ No tienes permisos para realizar esta acción.";
      }
      // Error de conexión
      else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network")) {
        errorMessage = "⚠️ No se puede conectar con el servidor. Verifica que el backend esté corriendo.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-sm text-gray-600 mb-4">
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre(s) *"
              value={formData.nombre}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="text"
              name="apellidoPaterno"
              placeholder="Apellido Paterno *"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="text"
              name="apellidoMaterno"
              placeholder="Apellido Materno"
              value={formData.apellidoMaterno}
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
              placeholder="INE (10 dígitos) *"
              value={formData.ine}
              onChange={handleChange}
              maxLength={10}
              pattern="\d{10}"
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
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
              placeholder="Celular (10 dígitos)"
              value={formData.celular}
              onChange={handleChange}
              maxLength={10}
              pattern="\d{10}"
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
              <label className="block text-sm text-gray-600 mb-1">
                Fecha de la cita <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaCita"
                value={formData.fechaCita}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Hora de la cita <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="horaCita"
                value={formData.horaCita}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                required
              />
            </div>

            <div className="col-span-2 bg-blue-50 p-4 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Persona a visitar (Opcional)
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Ingresa el nombre completo de la persona a visitar. NO necesita estar registrada en el sistema. Si solo deseas visitar un área, deja este campo vacío.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  name="personaVisitar"
                  placeholder="Nombre completo de la persona a visitar (ej: María González Ruiz)"
                  value={formData.personaVisitar}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  name="area"
                  placeholder="Área a visitar (ej: Rectoría, Sistemas, Biblioteca) *"
                  value={formData.area}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">El área es obligatoria y representa el destino principal de la visita</p>
              </div>
            </div>
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
                <div>
                  <input
                    type="text"
                    name="placas"
                    placeholder="Placas (ej: ABC1234) *"
                    value={formData.placas}
                    onChange={handleChange}
                    maxLength={12}
                    className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                    required={formData.medio === "En vehículo"}
                  />
                  <p className="text-xs text-gray-500 mt-1">5-12 caracteres alfanuméricos</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- BOTÓN DE ENVÍO --- */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-[#1a237e] text-white px-6 py-2 rounded-md hover:bg-[#303f9f] transition font-[Mitr] ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
