import { useState, useEffect } from "react";
import { citasAPI, horariosAPI } from "../services/api";
import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm, showLoading, closeLoading, showCustomAlert } from "../utils/alerts";

export default function Consultar() {
  const [visitantes, setVisitantes] = useState([]);
  const [visitantesFiltrados, setVisitantesFiltrados] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(""); // Nuevo filtro de estado
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCita, setSelectedCita] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState(null);
  const [horariosCoordinador, setHorariosCoordinador] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horasOcupadas, setHorasOcupadas] = useState([]);

  // 🔹 Obtener el rol del usuario del token
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.rol || "");
      }
    } catch (error) {
      console.error("Error al obtener el rol del usuario:", error);
    }
  }, []);

  // 🔹 Cargar las citas desde la API del backend
  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const citas = await citasAPI.getAll();
      console.log("Citas cargadas:", citas);
      
      // Transformar los datos para que coincidan con el formato esperado
      const citasFormateadas = citas.map(cita => ({
        id: cita.Id,
        nombre: `${cita.visitante?.Nombre || ''} ${cita.visitante?.Apellido_Paterno || ''} ${cita.visitante?.Apellido_Materno || ''}`.trim(),
        fechaCita: cita.Fecha,
        horaCita: cita.Hora,
        area: cita.Area || 'N/A',
        personaVisitada: cita.Nombre_Persona_Visitada || null,  // Campo de texto libre
        medio: cita.visitante?.Ingreso || 'N/A',
        estado: cita.Estado || 'activa',  // Estado de la cita
        visitante: cita.visitante,
        carro: cita.carro,
        usuario: cita.usuario_visitado
      }));
      
      setVisitantes(citasFormateadas);
      setVisitantesFiltrados(citasFormateadas); // Mostrar todos al inicio
    } catch (error) {
      console.error("Error al cargar citas:", error);
      showError("Error al cargar las citas. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manejar cambio de mes
  const handleMesChange = (e) => {
    const mes = e.target.value;
    setMesSeleccionado(mes);
    aplicarFiltros(mes, estadoSeleccionado);
  };

  // 🔹 Manejar cambio de estado
  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setEstadoSeleccionado(estado);
    aplicarFiltros(mesSeleccionado, estado);
  };

  // 🔹 Aplicar filtros combinados
  const aplicarFiltros = (mes, estado) => {
    let filtrados = [...visitantes];

    // Filtrar por mes
    if (mes !== "") {
      const mesNumero = obtenerNumeroMes(mes);
      filtrados = filtrados.filter((v) => {
        if (!v.fechaCita) return false;
        const fecha = new Date(v.fechaCita);
        return fecha.getMonth() + 1 === mesNumero;
      });
    }

    // Filtrar por estado
    if (estado !== "") {
      filtrados = filtrados.filter((v) => v.estado === estado);
    }

    setVisitantesFiltrados(filtrados);
  };

  // 🔹 Función para convertir el nombre del mes a número
  const obtenerNumeroMes = (mes) => {
    const meses = {
      Enero: 1,
      Febrero: 2,
      Marzo: 3,
      Abril: 4,
      Mayo: 5,
      Junio: 6,
      Julio: 7,
      Agosto: 8,
      Septiembre: 9,
      Octubre: 10,
      Noviembre: 11,
      Diciembre: 12,
    };
    return meses[mes];
  };

  // 🔹 Cargar horarios del coordinador cuando se selecciona una cita
  const cargarHorariosCoordinador = async (usuarioId) => {
    try {
      const horarios = await horariosAPI.getByUsuario(usuarioId);
      setHorariosCoordinador(horarios);
      return horarios;
    } catch (error) {
      console.error("Error al cargar horarios del coordinador:", error);
      showWarning("No se pudieron cargar los horarios del coordinador");
      return [];
    }
  };

  // 🔹 Generar horas disponibles según el día y horarios del coordinador
  const generarHorasDisponibles = (fecha, horarios) => {
    if (!fecha) {
      return [];
    }

    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    
    // Si no hay horarios (sin coordinador), generar horarios generales
    if (!horarios || horarios.length === 0) {
      return generarHorariosGenerales(fecha);
    }
    
    // Convertir el día de JavaScript (0-6, Domingo=0) al formato del backend (0=Lunes, 6=Domingo)
    let diaBackend;
    if (diaSemana === 0) {
      diaBackend = 6; // Domingo
    } else {
      diaBackend = diaSemana - 1; // Lunes=0, Martes=1, etc.
    }

    // Filtrar horarios "libres" para el día seleccionado
    const horariosDelDia = horarios.filter(
      h => h.Dia_Semana === diaBackend && h.Tipo === "libre"
    );

    if (horariosDelDia.length === 0) {
      return [];
    }

    // Generar array de horas disponibles
    const horasDisp = [];
    horariosDelDia.forEach(horario => {
      const [horaInicio] = horario.Hora_Inicio.split(':').map(Number);
      const [horaFin] = horario.Hora_Fin.split(':').map(Number);

      for (let hora = horaInicio; hora < horaFin; hora++) {
        horasDisp.push(`${hora.toString().padStart(2, '0')}:00`);
        horasDisp.push(`${hora.toString().padStart(2, '0')}:30`);
      }
    });

    return horasDisp.sort();
  };

  // 🔹 Generar horarios generales (cuando no hay coordinador)
  const generarHorariosGenerales = (fecha) => {
    if (!fecha) {
      return [];
    }

    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    
    // Domingo - no hay horarios
    if (diaSemana === 0) {
      return [];
    }

    const horasDisp = [];
    let horaInicio = 7;
    let horaFin = diaSemana === 6 ? 14 : 19; // Sábado hasta 14:00, otros días hasta 19:00

    for (let hora = horaInicio; hora < horaFin; hora++) {
      horasDisp.push(`${hora.toString().padStart(2, '0')}:00`);
      horasDisp.push(`${hora.toString().padStart(2, '0')}:30`);
    }

    return horasDisp;
  };

  // 🔹 Validar que la hora esté dentro de los horarios libres del coordinador
  const validarHoraConHorarioCoordinador = (fecha, hora, horarios) => {
    if (!horarios || horarios.length === 0) {
      return { valido: true, mensaje: "" }; // Si no hay horarios configurados, permitir
    }

    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay();
    
    let diaBackend;
    if (diaSemana === 0) {
      diaBackend = 6;
    } else {
      diaBackend = diaSemana - 1;
    }

    const horariosDelDia = horarios.filter(
      h => h.Dia_Semana === diaBackend && h.Tipo === "libre"
    );

    if (horariosDelDia.length === 0) {
      const nombresDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      return {
        valido: false,
        mensaje: `El coordinador no tiene horarios disponibles para ${nombresDias[diaBackend]}`
      };
    }

    // Verificar si la hora está dentro de algún horario libre
    const [horaSeleccionada, minutoSeleccionado] = hora.split(':').map(Number);
    const minutosTotales = horaSeleccionada * 60 + minutoSeleccionado;

    const estaEnHorario = horariosDelDia.some(horario => {
      const [horaInicio, minInicio] = horario.Hora_Inicio.split(':').map(Number);
      const [horaFin, minFin] = horario.Hora_Fin.split(':').map(Number);
      
      const minutosInicio = horaInicio * 60 + minInicio;
      const minutosFin = horaFin * 60 + minFin;

      return minutosTotales >= minutosInicio && minutosTotales < minutosFin;
    });

    if (!estaEnHorario) {
      return {
        valido: false,
        mensaje: "La hora seleccionada no está dentro del horario disponible del coordinador"
      };
    }

    return { valido: true, mensaje: "" };
  };

  // 🔹 Manejar cambio de fecha en el modal de reagendar
  const handleDateChange = async (nuevaFecha) => {
    setSelectedDate(nuevaFecha);
    setSelectedTime(""); // Reset hora cuando cambia la fecha
    
    if (nuevaFecha) {
      if (selectedCita?.usuario?.Id && horariosCoordinador.length > 0) {
        // Si hay coordinador con horarios, usar sus horarios
        const horas = generarHorasDisponibles(nuevaFecha, horariosCoordinador);
        setHorasDisponibles(horas);
      } else {
        // Sin coordinador o sin horarios configurados, usar horarios generales
        const horas = generarHorariosGenerales(nuevaFecha);
        setHorasDisponibles(horas);
      }
      
      // Las horas ocupadas se cargarán automáticamente por el useEffect
    }
  };

  // 🔹 Cargar horas ocupadas cuando cambia la fecha, área o coordinador en el modal de reagendar
  useEffect(() => {
    const cargarHorasOcupadas = async () => {
      if (selectedDate && selectedCita) {
        try {
          // Filtrar por área y opcionalmente por coordinador
          const area = selectedCita.area || null;
          const personaVisitadaId = selectedCita.usuario?.Id || null;
          
          const response = await citasAPI.getHorasOcupadas(
            selectedDate, 
            area, 
            personaVisitadaId
          );
          
          // Filtrar la hora actual de la cita que se está reagendando
          const horasOcupadasFiltradas = (response.horas_ocupadas || []).filter(
            hora => !(selectedCita.fechaCita === selectedDate && selectedCita.horaCita === hora)
          );
          
          setHorasOcupadas(horasOcupadasFiltradas);
        } catch (error) {
          console.error("Error al cargar horas ocupadas:", error);
          setHorasOcupadas([]);
        }
      }
    };
    
    cargarHorasOcupadas();
  }, [selectedDate, selectedCita]);

  // 🔹 Guardar cambios de reagendar
  const handleReagendar = async () => {
    try {
      if (!selectedCita || !selectedCita.id) {
        showError("No se pudo identificar la cita", "Error");
        return;
      }

      if (!selectedDate || !selectedTime) {
        showWarning("Por favor selecciona una fecha y hora", "Campos incompletos");
        return;
      }

      // Validar fecha no anterior a hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaSeleccionada = new Date(selectedDate + 'T00:00:00');
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        showWarning("La nueva fecha no puede ser anterior a hoy", "Fecha inválida");
        return;
      }

      // Validar que no sea domingo
      const diaSemana = fechaSeleccionada.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      if (diaSemana === 0) {
        showWarning(
          "No se pueden agendar citas los domingos.\n\nHorario de atención:\n• Lunes a Viernes: 7:00 AM - 7:00 PM\n• Sábados: 7:00 AM - 2:00 PM",
          "Domingo no disponible"
        );
        return;
      }

      // Validar hora de la cita según el día
      const [horasCita, minutosCita] = selectedTime.split(':').map(Number);
      const minutosCitaTotal = horasCita * 60 + minutosCita;

      // Validación de horarios laborales según el día
      if (diaSemana >= 1 && diaSemana <= 5) {
        // Lunes a Viernes: 7:00 AM - 7:00 PM (07:00 - 19:00)
        if (horasCita < 7 || horasCita >= 19) {
          showWarning(
            "Lunes a Viernes:\n• Horario de atención: 7:00 AM - 7:00 PM\n\nPor favor selecciona una hora entre las 7:00 AM y las 7:00 PM",
            "Horario no disponible"
          );
          return;
        }
      } else if (diaSemana === 6) {
        // Sábado: 7:00 AM - 2:00 PM (07:00 - 14:00)
        if (horasCita < 7 || horasCita >= 14) {
          showWarning(
            "Sábados:\n• Horario de atención: 7:00 AM - 2:00 PM\n\nPor favor selecciona una hora entre las 7:00 AM y las 2:00 PM",
            "Horario no disponible"
          );
          return;
        }
      }

      // 🔹 NUEVA VALIDACIÓN: Verificar horarios del coordinador
      if (selectedCita.usuario?.Id && horariosCoordinador.length > 0) {
        const validacion = validarHoraConHorarioCoordinador(selectedDate, selectedTime, horariosCoordinador);
        if (!validacion.valido) {
          showWarning(validacion.mensaje, "Horario no disponible del coordinador");
          return;
        }
      }

      // 🔹 Validar que la hora no esté ocupada en la misma área / coordinador
      if (horasOcupadas.includes(selectedTime)) {
        showWarning(
          `La hora ${selectedTime} ya está ocupada ${selectedCita.area ? `en el área "${selectedCita.area}"` : ''} ${selectedCita.usuario ? `con ${selectedCita.personaVisitada || 'el coordinador'}` : ''}.\n\nPor favor selecciona otro horario disponible.`,
          "Horario ocupado"
        );
        return;
      }

      // Validar hora de la cita si es para hoy
      if (fechaSeleccionada.getTime() === hoy.getTime()) {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        const minutoActual = ahora.getMinutes();
        const minutosActualTotal = horaActual * 60 + minutoActual;
        
        if (minutosCitaTotal <= minutosActualTotal) {
          showWarning(
            `La hora de la cita no puede ser anterior o igual a la hora actual.\nHora actual: ${horaActual}:${minutoActual.toString().padStart(2, '0')}`,
            "Hora inválida"
          );
          return;
        }
        
        // Validar que haya al menos 30 minutos de anticipación
        if (minutosCitaTotal < minutosActualTotal + 30) {
          showWarning("Por favor reagenda la cita con al menos 30 minutos de anticipación desde ahora", "Anticipación requerida");
          return;
        }
      }

      showLoading("Reagendando cita...");
      setLoading(true);

      // Llamar a la API para actualizar la cita
      await citasAPI.update(selectedCita.id, {
        Fecha: selectedDate,
        Hora: selectedTime
      });

      // Recargar las citas desde el backend
      await cargarCitas();

      // Cerrar modal
      setShowModal(false);
      closeLoading();
      await showSuccess(
        "La cita ha sido reagendada correctamente. Se ha enviado un correo de confirmación con los nuevos detalles.",
        "¡Cita reagendada!"
      );
    } catch (error) {
      console.error("Error al reagendar:", error);
      closeLoading();
      
      // Manejar errores específicos del backend
      let errorMessage = error.message || "Error desconocido";
      let errorTitle = "Error al reagendar";
      
      if (errorMessage.includes("La fecha no puede ser anterior")) {
        showWarning("La fecha seleccionada no es válida. Debe ser igual o posterior a la fecha actual.", "Fecha inválida");
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        showError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "Sesión expirada");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        showError("No tienes permisos para reagendar esta cita.", "Acceso denegado");
      } else {
        showError("Error al reagendar la cita. Por favor intenta de nuevo.", errorTitle);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ver detalles de la cita
  const verDetalles = (cita) => {
    console.log("📋 Detalles de la cita:", cita);
    console.log("🚗 Información del carro:", cita.carro);
    setCitaDetalle(cita);
    setShowDetallesModal(true);
  };

  const cerrarDetalles = () => {
    setShowDetallesModal(false);
    setCitaDetalle(null);
  };

  // 🔹 Eliminar cita
  const handleEliminar = async (cita) => {
    // Confirmación personalizada que menciona la eliminación del visitante
    const result = await showCustomAlert({
      icon: 'warning',
      title: '¿Eliminar cita?',
      html: `
        ¿Estás seguro de que deseas eliminar la cita de <strong>${cita.nombre}</strong>?<br>
        <br>
        <small class="text-gray-600">ℹ️ <strong>Nota:</strong> Si el visitante no tiene otras citas, su registro también será eliminado de la base de datos.</small><br>
        <small class="text-red-600">Esta acción no se puede deshacer.</small>
      `,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    
    if (!result.isConfirmed) {
      return;
    }

    try {
      showLoading("Eliminando cita...");
      setLoading(true);
      await citasAPI.delete(cita.id);
      
      // Recargar las citas
      await cargarCitas();
      
      closeLoading();
      await showSuccess("La cita ha sido eliminada correctamente", "¡Eliminado!");
    } catch (error) {
      console.error("Error al eliminar:", error);
      closeLoading();
      
      let errorMessage = error.message || "Error desconocido";
      
      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        showError("No tienes permisos para eliminar esta cita.", "Acceso denegado");
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        showError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "Sesión expirada");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        showError("Error al eliminar la cita. Por favor intenta de nuevo.", "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg p-8 rounded-2xl">
      <h2 className="text-2xl mb-6 text-[#20232b] font-[Mitr]">
        Consultar registros
      </h2>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Selector de mes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes
          </label>
          <select
            value={mesSeleccionado}
            onChange={handleMesChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-[#37AADF] focus:border-[#37AADF]"
          >
            <option value="">-- Todos los meses --</option>
            <option>Enero</option>
            <option>Febrero</option>
            <option>Marzo</option>
            <option>Abril</option>
            <option>Mayo</option>
            <option>Junio</option>
            <option>Julio</option>
            <option>Agosto</option>
            <option>Septiembre</option>
            <option>Octubre</option>
            <option>Noviembre</option>
            <option>Diciembre</option>
          </select>
        </div>

        {/* Selector de estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={estadoSeleccionado}
            onChange={handleEstadoChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-[#37AADF] focus:border-[#37AADF]"
          >
            <option value="">-- Todos los estados --</option>
            <option value="activa">Activas</option>
            <option value="completada">Completadas</option>
          </select>
        </div>
      </div>

      {/* Tabla de registros */}
      {loading ? (
        <div className="text-center p-8">
          <p className="text-gray-500">Cargando citas...</p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e3a8a] text-white">
              <th className="p-3">Nombre visitante</th>
              <th className="p-3">Fecha de cita</th>
              <th className="p-3">Hora</th>
              <th className="p-3">Persona a visitar</th>
              <th className="p-3">Área visitada</th>
              <th className="p-3">Medio de ingreso</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visitantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No hay registros
                </td>
              </tr>
            ) : (
              visitantesFiltrados.map((v, i) => (
                <tr key={v.id || i} className="hover:bg-gray-100 border-b">
                  <td className="p-3">{v.nombre}</td>
                  <td className="p-3">{v.fechaCita}</td>
                  <td className="p-3">{v.horaCita}</td>
                  <td className="p-3">
                    {v.personaVisitada ? (
                      <span className="text-blue-700 font-medium">{v.personaVisitada}</span>
                    ) : (
                      <span className="text-gray-500 italic">Sin persona específica</span>
                    )}
                  </td>
                  <td className="p-3">{v.area}</td>
                  <td className="p-3">{v.medio}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      v.estado === 'activa' ? 'bg-green-100 text-green-800' :
                      v.estado === 'completada' ? 'bg-gray-100 text-gray-800' :
                      v.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {v.estado === 'activa' ? '🟢 Activa' :
                       v.estado === 'completada' ? '⚪ Completada' :
                       v.estado === 'cancelada' ? '🔴 Cancelada' :
                       v.estado}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => verDetalles(v)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md shadow hover:bg-blue-700 transition font-[Mitr]"
                      >
                        Ver Detalles
                      </button>
                      {userRole !== "vigilancia" && (
                        <>
                          <button
                          onClick={async () => {
                            setSelectedCita(v);
                            setSelectedDate(v.fechaCita);
                            setSelectedTime(v.horaCita);
                            setHorasDisponibles([]);
                            setHorariosCoordinador([]);
                            
                            // Cargar horarios del coordinador si existe
                            if (v.usuario?.Id) {
                              showLoading("Cargando horarios disponibles...");
                              try {
                                const horarios = await cargarHorariosCoordinador(v.usuario.Id);
                                
                                // Generar horas disponibles para la fecha actual
                                if (horarios && horarios.length > 0) {
                                  const horas = generarHorasDisponibles(v.fechaCita, horarios);
                                  setHorasDisponibles(horas);
                                } else {
                                  // Sin horarios configurados para el coordinador
                                  setHorasDisponibles([]);
                                }
                              } catch (error) {
                                console.error("Error al cargar horarios:", error);
                              } finally {
                                closeLoading();
                              }
                            } else {
                              // Sin coordinador asignado - usar horarios generales
                              const horas = generarHorariosGenerales(v.fechaCita);
                              setHorasDisponibles(horas);
                            }
                            
                            setShowModal(true);
                          }}
                          className="bg-[#1e3a8a] text-white px-3 py-1 rounded-md shadow hover:bg-[#2b4fc4] transition font-[Mitr]"
                        >
                          Reagendar
                        </button>
                        <button
                          onClick={() => handleEliminar(v)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md shadow hover:bg-red-700 transition font-[Mitr]"
                        >
                          Eliminar
                        </button>
                        </>
                      )}
                      </div>
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal para reagendar */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[480px] relative">
            <h2 className="text-lg font-semibold mb-4 text-[#1e3a8a]">
              Reagendar cita
            </h2>

            {/* Información del coordinador */}
            {selectedCita?.usuario ? (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-semibold text-purple-800 mb-1">👨‍💼 Coordinador asignado:</p>
                <p className="text-sm text-purple-900 font-medium">
                  {selectedCita.usuario.Nombre} {selectedCita.usuario.Apellido_Paterno}
                </p>
                {horariosCoordinador.length > 0 ? (
                  <p className="text-xs text-purple-600 mt-1">
                    ✓ Horarios personalizados configurados
                  </p>
                ) : (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Sin horarios configurados - usando horarios generales
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-1">ℹ️ Información:</p>
                <p className="text-sm text-blue-900">
                  Esta cita no tiene coordinador asignado
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Se usará el horario general de atención
                </p>
              </div>
            )}

            {/* Información de horarios generales */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-2">📅 Horario general de atención:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Lunes a Viernes: 7:00 AM - 7:00 PM</li>
                <li>• Sábados: 7:00 AM - 2:00 PM</li>
                <li>• Domingos: Cerrado</li>
              </ul>
            </div>

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nueva fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-md w-full mb-3 px-3 py-2 focus:ring-2 focus:ring-[#37AADF]"
              required
            />

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nueva hora
            </label>
            
            {/* Mostrar selector de horas si hay fecha seleccionada */}
            {selectedDate ? (
              horasDisponibles.length > 0 ? (
                <>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="border border-gray-300 rounded-md w-full mb-2 px-3 py-2 focus:ring-2 focus:ring-[#37AADF]"
                    required
                  >
                    <option value="">-- Selecciona una hora --</option>
                    {horasDisponibles.map(hora => {
                      const estaOcupada = horasOcupadas.includes(hora);
                      return (
                        <option 
                          key={hora} 
                          value={hora}
                          disabled={estaOcupada}
                          style={estaOcupada ? { color: '#999', backgroundColor: '#f0f0f0' } : {}}
                        >
                          {hora} {estaOcupada ? '(Ocupada)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-green-600 mb-2">
                    {selectedCita?.usuario?.Id && horariosCoordinador.length > 0
                      ? "✓ Mostrando horarios disponibles del coordinador"
                      : "✓ Mostrando horarios generales de atención"}
                  </p>
                  {horasOcupadas.length > 0 && (
                    <p className="text-xs text-orange-600 mb-4">
                      ⚠️ Algunas horas están ocupadas {selectedCita?.area ? `en el área "${selectedCita.area}"` : ''}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="border border-red-300 bg-red-50 rounded-md w-full mb-2 px-3 py-2 text-red-700 text-sm">
                    No hay horarios disponibles para esta fecha
                  </div>
                  <p className="text-xs text-red-600 mb-4">
                    {selectedCita?.usuario?.Id && horariosCoordinador.length > 0
                      ? "El coordinador no tiene horarios configurados para el día seleccionado"
                      : "No hay atención disponible para este día (verifique que no sea domingo)"}
                  </p>
                </>
              )
            ) : (
              <>
                <div className="border border-gray-300 bg-gray-50 rounded-md w-full mb-2 px-3 py-2 text-gray-700 text-sm">
                  Selecciona una fecha para ver los horarios disponibles
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  ℹ️ Esperando selección de fecha
                </p>
              </>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setHorasDisponibles([]);
                  setHorariosCoordinador([]);
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReagendar}
                disabled={
                  !selectedDate || 
                  !selectedTime || 
                  horasDisponibles.length === 0
                }
                className="px-4 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-[#2b4fc4] transition font-[Mitr] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Cita - Diseño Simple */}
      {showDetallesModal && citaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#1e3a8a] px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Detalles de la Cita</h3>
              <button
                onClick={cerrarDetalles}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition text-2xl"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del Visitante */}
              <div>
                <h4 className="text-lg font-bold text-gray-700 mb-3 pb-2 border-b-2 border-gray-200">
                  👤 Información del Visitante
                </h4>
                <div className="space-y-3">
                  <div className="flex border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium w-40">Nombre:</span>
                    <span className="text-gray-900 font-semibold flex-1">{citaDetalle.nombre}</span>
                  </div>
                  {citaDetalle.visitante?.Genero && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">Género:</span>
                      <span className="text-gray-900 font-semibold flex-1">{citaDetalle.visitante.Genero}</span>
                    </div>
                  )}
                  {citaDetalle.visitante?.Fecha_Nacimiento && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">Fecha de Nacimiento:</span>
                      <span className="text-gray-900 font-semibold flex-1">
                        {new Date(citaDetalle.visitante.Fecha_Nacimiento).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {citaDetalle.visitante?.Ine && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">INE:</span>
                      <span className="text-gray-900 font-semibold flex-1">{citaDetalle.visitante.Ine}</span>
                    </div>
                  )}
                  {citaDetalle.visitante?.Numero && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">Teléfono:</span>
                      <span className="text-gray-900 font-semibold flex-1">{citaDetalle.visitante.Numero}</span>
                    </div>
                  )}
                  {citaDetalle.visitante?.Correo && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">Correo:</span>
                      <span className="text-gray-900 font-semibold flex-1 break-all">{citaDetalle.visitante.Correo}</span>
                    </div>
                  )}
                  <div className="flex border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium w-40">Medio de Ingreso:</span>
                    <span className="text-gray-900 font-semibold flex-1">{citaDetalle.visitante?.Ingreso || citaDetalle.medio}</span>
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              {citaDetalle.carro && (
                <div>
                  <h4 className="text-lg font-bold text-gray-700 mb-3 pb-2 border-b-2 border-gray-200">
                    🚗 Información del Vehículo
                  </h4>
                  <div className="space-y-3">
                    {citaDetalle.carro.Marca && (
                      <div className="flex border-b border-gray-100 pb-2">
                        <span className="text-gray-600 font-medium w-40">Marca:</span>
                        <span className="text-gray-900 font-semibold flex-1">{citaDetalle.carro.Marca}</span>
                      </div>
                    )}
                    {citaDetalle.carro.Modelo && (
                      <div className="flex border-b border-gray-100 pb-2">
                        <span className="text-gray-600 font-medium w-40">Modelo:</span>
                        <span className="text-gray-900 font-semibold flex-1">{citaDetalle.carro.Modelo}</span>
                      </div>
                    )}
                    {citaDetalle.carro.Color && (
                      <div className="flex border-b border-gray-100 pb-2">
                        <span className="text-gray-600 font-medium w-40">Color:</span>
                        <span className="text-gray-900 font-semibold flex-1">{citaDetalle.carro.Color}</span>
                      </div>
                    )}
                    {citaDetalle.carro.Placas && (
                      <div className="flex border-b border-gray-100 pb-2">
                        <span className="text-gray-600 font-medium w-40">Placas:</span>
                        <span className="text-gray-900 font-bold flex-1 text-xl tracking-wider">{citaDetalle.carro.Placas}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de la Cita */}
              <div>
                <h4 className="text-lg font-bold text-gray-700 mb-3 pb-2 border-b-2 border-gray-200">
                  📅 Información de la Cita
                </h4>
                <div className="space-y-3">
                  <div className="flex border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium w-40">Fecha:</span>
                    <span className="text-gray-900 font-semibold flex-1 capitalize">
                      {new Date(citaDetalle.fechaCita).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium w-40">Hora:</span>
                    <span className="text-gray-900 font-semibold flex-1 text-lg">{citaDetalle.horaCita}</span>
                  </div>
                  <div className="flex border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium w-40">Área:</span>
                    <span className="text-gray-900 font-semibold flex-1">{citaDetalle.area}</span>
                  </div>
                  {citaDetalle.personaVisitada && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">Persona a Visitar:</span>
                      <span className="text-gray-900 font-semibold flex-1">{citaDetalle.personaVisitada}</span>
                    </div>
                  )}
                  {citaDetalle.usuario && (
                    <div className="flex border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium w-40">Coordinador:</span>
                      <span className="text-gray-900 font-semibold flex-1">
                        {citaDetalle.usuario.Nombre} {citaDetalle.usuario.Apellido_Paterno}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t">
              <div className="flex justify-end">
                <button
                  onClick={cerrarDetalles}
                  className="bg-[#1e3a8a] hover:bg-[#2b4fc4] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
