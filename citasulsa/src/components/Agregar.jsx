import { useState } from "react";
import { visitantesAPI, carrosAPI, citasAPI } from "../services/api";

export default function Agregar({ visitantes, setVisitantes }) {
  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "",
    fechaNacimiento: "",
    ine: "",
    correo: "",
    celular: "",
    fechaCita: getFechaHoy(),  // Pre-seleccionar hoy por defecto
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
  const [visitaPersonaEspecifica, setVisitaPersonaEspecifica] = useState(false);

  // Función para verificar si la fecha seleccionada es hoy
  const esFechaHoy = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    fechaSeleccionada.setHours(0, 0, 0, 0);
    return fechaSeleccionada.getTime() === hoy.getTime();
  };

  // Función para obtener mensaje dinámico de hora
  const getMensajeHora = () => {
    if (!formData.fechaCita) {
      return 'Selecciona primero una fecha';
    }
    
    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay();
    
    // Validar si es domingo
    if (diaSemana === 0) {
      return '❌ No se atiende los domingos';
    }
    
    // Mensaje base según el día
    let horarioBase = '';
    if (diaSemana >= 1 && diaSemana <= 5) {
      horarioBase = 'Lun-Vie: 7:00 AM - 7:00 PM';
    } else if (diaSemana === 6) {
      horarioBase = 'Sábado: 7:00 AM - 2:00 PM';
    }
    
    // Si es hoy, agregar restricción de tiempo
    if (esFechaHoy(formData.fechaCita)) {
      const ahora = new Date();
      const horaMin = ahora.getHours();
      const minMin = ahora.getMinutes() + 30;
      const horaFinal = Math.floor(minMin / 60) + horaMin;
      const minFinal = minMin % 60;
      return `${horarioBase} | Hoy: después de ${horaFinal}:${minFinal.toString().padStart(2, '0')}`;
    }
    
    return horarioBase;
  };

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
      // Solo permitir letras y números en placas
      processedValue = processedValue.replace(/[^A-Z0-9]/g, '');
    }
    
    // Para nombres: solo letras, espacios y tildes (sin números ni caracteres especiales)
    if (['nombre', 'apellidoPaterno', 'apellidoMaterno', 'personaVisitar'].includes(name)) {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      // Limitar espacios consecutivos
      processedValue = processedValue.replace(/\s+/g, ' ');
      // No permitir espacios al inicio
      if (processedValue.startsWith(' ')) {
        processedValue = processedValue.trimStart();
      }
    }
    
    // Para marca, modelo y color del vehículo
    if (['marca', 'modelo', 'color'].includes(name)) {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-]/g, '');
      processedValue = processedValue.replace(/\s+/g, ' ');
      if (processedValue.startsWith(' ')) {
        processedValue = processedValue.trimStart();
      }
    }
    
    // Para correo: no permitir espacios
    if (name === 'correo') {
      processedValue = value.replace(/\s/g, '').toLowerCase();
    }
    
    // Validación especial para hora si la fecha es hoy
    if (name === 'horaCita' && formData.fechaCita) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      // Si es hoy, validar que la hora sea futura
      if (fechaSeleccionada.getTime() === hoy.getTime() && value) {
        const ahora = new Date();
        const [horasCita, minutosCita] = value.split(':').map(Number);
        const minutosCitaTotal = horasCita * 60 + minutosCita;
        const minutosActualTotal = ahora.getHours() * 60 + ahora.getMinutes();
        
        // Advertencia visual si la hora es muy cercana o pasada
        if (minutosCitaTotal <= minutosActualTotal + 30) {
          // Solo mostrar advertencia, pero permitir que el usuario escriba
          console.warn('La hora debe ser al menos 30 minutos en el futuro');
        }
      }
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

    // Validar longitud mínima de nombres
    if (formData.nombre.trim().length < 2) {
      alert("⚠️ El nombre debe tener al menos 2 caracteres");
      return;
    }
    
    if (formData.apellidoPaterno.trim().length < 2) {
      alert("⚠️ El apellido paterno debe tener al menos 2 caracteres");
      return;
    }
    
    if (formData.apellidoMaterno && formData.apellidoMaterno.trim().length > 0 && formData.apellidoMaterno.trim().length < 2) {
      alert("⚠️ El apellido materno debe tener al menos 2 caracteres o dejarlo vacío");
      return;
    }

    if (!formData.area || !formData.area.trim()) {
      alert("⚠️ Por favor selecciona el área a visitar");
      return;
    }

    // Validación de INE: 10 dígitos exactos (obligatorio)
    if (!formData.ine || formData.ine.length !== 10) {
      alert("⚠️ El INE es obligatorio y debe tener exactamente 10 dígitos numéricos");
      return;
    }

    // Validación de celular: 10 dígitos exactos (obligatorio)
    if (!formData.celular || formData.celular.length !== 10) {
      alert("⚠️ El número de celular es obligatorio y debe tener exactamente 10 dígitos");
      return;
    }

    // Validar correo electrónico (obligatorio)
    if (!formData.correo || !formData.correo.trim()) {
      alert("⚠️ El correo electrónico es obligatorio");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      alert("⚠️ Por favor ingresa un correo electrónico válido");
      return;
    }
    
    // Validar que el dominio del correo tenga al menos 2 caracteres después del punto
    const dominioPartes = formData.correo.split('@')[1]?.split('.');
    if (!dominioPartes || dominioPartes[dominioPartes.length - 1].length < 2) {
      alert("⚠️ El dominio del correo electrónico no es válido");
      return;
    }

    // Validar fecha de nacimiento (si se proporciona, no puede ser actual o futura)
    if (formData.fechaNacimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaNac = new Date(formData.fechaNacimiento);
      fechaNac.setHours(0, 0, 0, 0);
      
      if (fechaNac >= hoy) {
        alert("⚠️ La fecha de nacimiento no puede ser hoy o una fecha futura");
        return;
      }
      
      // Validar que la persona tenga al menos 1 año (evitar errores)
      const unAnoAtras = new Date();
      unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
      if (fechaNac > unAnoAtras) {
        alert("⚠️ La fecha de nacimiento indica que la persona es menor de 1 año. Por favor verifica la fecha");
        return;
      }
      
      // Validar que la fecha no sea demasiado antigua (mayor a 120 años)
      const cientoVeinteAnosAtras = new Date();
      cientoVeinteAnosAtras.setFullYear(cientoVeinteAnosAtras.getFullYear() - 120);
      if (fechaNac < cientoVeinteAnosAtras) {
        alert("⚠️ La fecha de nacimiento no es válida. Por favor verifica la fecha");
        return;
      }
    }
    
    // Validar persona a visitar si se proporciona
    if (formData.personaVisitar && formData.personaVisitar.trim().length > 0) {
      if (formData.personaVisitar.trim().length < 3) {
        alert("⚠️ El nombre de la persona a visitar debe tener al menos 3 caracteres");
        return;
      }
      
      // Validar que tenga al menos un espacio (nombre y apellido)
      if (!formData.personaVisitar.trim().includes(' ')) {
        alert("⚠️ Por favor ingresa el nombre completo de la persona a visitar (nombre y apellido)");
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
      
      // Validar que las placas tengan al menos una letra y un número
      const tieneLetra = /[A-Z]/.test(formData.placas);
      const tieneNumero = /[0-9]/.test(formData.placas);
      if (!tieneLetra || !tieneNumero) {
        alert("⚠️ Las placas deben contener al menos una letra y un número");
        return;
      }
    }

    // Validar fecha de cita (puede ser hoy o en el futuro, pero no en el pasado)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      alert("⚠️ La fecha de la cita no puede ser anterior a hoy");
      return;
    }

    // Validar que no sea domingo
    const diaSemana = fechaSeleccionada.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    if (diaSemana === 0) {
      alert("⚠️ No se pueden agendar citas los domingos.\n\nHorario de atención:\n• Lunes a Viernes: 7:00 AM - 7:00 PM\n• Sábados: 7:00 AM - 2:00 PM");
      return;
    }

    // Validar hora de la cita según el día
    const [horasCita, minutosCita] = formData.horaCita.split(':').map(Number);
    const minutosCitaTotal = horasCita * 60 + minutosCita;

    // Validación de horarios laborales según el día
    if (diaSemana >= 1 && diaSemana <= 5) {
      // Lunes a Viernes: 7:00 AM - 7:00 PM (07:00 - 19:00)
      if (horasCita < 7 || horasCita >= 19) {
        alert("⚠️ Horario no disponible.\n\nLunes a Viernes:\n• Horario de atención: 7:00 AM - 7:00 PM\n\nPor favor selecciona una hora entre las 7:00 AM y las 7:00 PM");
        return;
      }
    } else if (diaSemana === 6) {
      // Sábado: 7:00 AM - 2:00 PM (07:00 - 14:00)
      if (horasCita < 7 || horasCita >= 14) {
        alert("⚠️ Horario no disponible para sábado.\n\nSábados:\n• Horario de atención: 7:00 AM - 2:00 PM\n\nPor favor selecciona una hora entre las 7:00 AM y las 2:00 PM");
        return;
      }
    }

    // Validar hora de la cita si es para hoy
    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutoActual = ahora.getMinutes();
      const minutosActualTotal = horaActual * 60 + minutoActual;
      
      if (minutosCitaTotal <= minutosActualTotal) {
        alert(`⚠️ La hora de la cita no puede ser anterior o igual a la hora actual.\nHora actual: ${horaActual}:${minutoActual.toString().padStart(2, '0')}`);
        return;
      }
      
      // Validar que haya al menos 30 minutos de anticipación
      if (minutosCitaTotal < minutosActualTotal + 30) {
        alert("⚠️ Por favor agenda la cita con al menos 30 minutos de anticipación desde ahora");
        return;
      }
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
        fechaCita: getFechaHoy(),  // Volver a poner fecha de hoy
        horaCita: "",
        personaVisitar: "",
        area: "",
        medio: "A pie",
        marca: "",
        modelo: "",
        color: "",
        placas: "",
      });
      setVisitaPersonaEspecifica(false);
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
                max={new Date().toISOString().split('T')[0]}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                title="El visitante debe tener al menos 15 años"
              />
              <p className="text-xs text-gray-500 mt-1">El visitante debe tener al menos 15 años</p>
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
              placeholder="Correo electrónico *"
              value={formData.correo}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="tel"
              name="celular"
              placeholder="Celular (10 dígitos) *"
              value={formData.celular}
              onChange={handleChange}
              maxLength={10}
              pattern="\d{10}"
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />
          </div>
        </section>

        {/* --- DATOS DE LA CITA --- */}
        <section>
          <h2 className="text-xl text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Datos de la cita
          </h2>
          
          {/* Información de horarios */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">📅 Horario de atención:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• <span className="font-medium">Lunes a Viernes:</span> 7:00 AM - 7:00 PM</p>
              <p>• <span className="font-medium">Sábados:</span> 7:00 AM - 2:00 PM</p>
              <p>• <span className="font-medium text-red-600">Domingos:</span> Cerrado</p>
            </div>
          </div>

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
                min={getFechaHoy()}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Por defecto es hoy, pero puedes cambiarla</p>
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
                disabled={formData.fechaCita && new Date(formData.fechaCita + 'T00:00:00').getDay() === 0}
              />
              <p className={`text-xs mt-1 font-medium ${
                formData.fechaCita && new Date(formData.fechaCita + 'T00:00:00').getDay() === 0 
                  ? 'text-red-600' 
                  : esFechaHoy(formData.fechaCita) 
                    ? 'text-orange-600' 
                    : 'text-blue-600'
              }`}>
                {getMensajeHora()}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Área a visitar <span className="text-red-500">*</span>
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                required
              >
                <option value="">Selecciona el área a visitar</option>
                
                <optgroup label="📚 Áreas Académicas">
                  <option value="Arquitectura y Diseño">Arquitectura y Diseño</option>
                  <option value="Ciencias Sociales y Humanidades">Ciencias Sociales y Humanidades</option>
                  <option value="Negocios y Economía">Negocios y Economía</option>
                  <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                  <option value="Turismo y Gastronomía">Turismo y Gastronomía</option>
                  <option value="Ingenierías">Ingenierías</option>
                </optgroup>
                
                <optgroup label="🏗️ Instalaciones Académicas">
                  <option value="Laboratorios">Laboratorios</option>
                  <option value="Talleres">Talleres</option>
                  <option value="Biblioteca">Biblioteca</option>
                </optgroup>
                
                <optgroup label="👩🏻‍💼 Servicios Administrativos">
                  <option value="Rectoría">Rectoría</option>
                  <option value="Control Escolar">Control Escolar</option>
                  <option value="Servicios Escolares">Servicios Escolares</option>
                  <option value="Admisiones">Admisiones</option>
                  <option value="Caja / Pagos">Caja / Pagos</option>
                </optgroup>
                
                <optgroup label="⚽️ Servicios Generales">
                  <option value="Cafetería">Cafetería</option>
                  <option value="Instalaciones Deportivas">Instalaciones Deportivas</option>
                  <option value="Áreas Comunes">Áreas Comunes</option>
                </optgroup>
                
                <optgroup label="➕ Otro">
                  <option value="Otra área">Otra área</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-medium text-gray-700">Área obligatoria:</span> Selecciona el destino principal de la visita
              </p>
            </div>

            <div className="col-span-2 bg-blue-50 p-4 rounded-md border border-blue-200">
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={visitaPersonaEspecifica}
                  onChange={(e) => {
                    setVisitaPersonaEspecifica(e.target.checked);
                    if (!e.target.checked) {
                      setFormData({ ...formData, personaVisitar: "" });
                    }
                  }}
                  className="w-4 h-4 text-[#1a237e] focus:ring-[#1a237e]"
                />
                <span className="text-sm font-medium text-blue-800">
                  ¿Deseas visitar a una persona específica? (Opcional)
                </span>
              </label>
              
              {visitaPersonaEspecifica && (
                <div>
                  <p className="text-xs text-blue-600 mb-3">
                    Ingresa el nombre completo de la persona a visitar en el área seleccionada.
                  </p>
                  <input
                    type="text"
                    name="personaVisitar"
                    placeholder="Nombre completo de la persona a visitar (ej: María González Ruiz)"
                    value={formData.personaVisitar}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                  />
                </div>
              )}
              
              {!visitaPersonaEspecifica && (
                <p className="text-xs text-blue-600">
                  Si solo visitas un área sin persona específica, deja esta opción sin marcar.
                </p>
              )}
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
