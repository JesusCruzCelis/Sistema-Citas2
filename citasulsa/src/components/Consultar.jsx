import { useState, useEffect } from "react";
import { citasAPI } from "../services/api";
import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm, showLoading, closeLoading, showCustomAlert } from "../utils/alerts";

export default function Consultar() {
  const [visitantes, setVisitantes] = useState([]);
  const [visitantesFiltrados, setVisitantesFiltrados] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCita, setSelectedCita] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

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
        visitante: cita.visitante,
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

    if (mes === "") {
      // Si no se selecciona ningún mes, mostrar todo
      setVisitantesFiltrados(visitantes);
      return;
    }

    // Filtrar por mes
    const mesNumero = obtenerNumeroMes(mes);
    const filtrados = visitantes.filter((v) => {
      if (!v.fechaCita) return false;
      const fecha = new Date(v.fechaCita);
      return fecha.getMonth() + 1 === mesNumero;
    });

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
      
      // Mostrar información de contacto
      await showInfo(
        "Para cualquier duda sobre tu cita, contáctanos al: 951 458 1314",
        "Confirmación enviada"
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

      {/* Selector de mes funcional */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mes
        </label>
        <select
          value={mesSeleccionado}
          onChange={handleMesChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-60 shadow-sm focus:ring-2 focus:ring-[#37AADF] focus:border-[#37AADF]"
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
              {userRole !== "vigilancia" && (
                <th className="p-3 text-center">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {visitantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={userRole !== "vigilancia" ? "7" : "6"} className="text-center p-4 text-gray-500">
                  No hay registros en este mes
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
                  {userRole !== "vigilancia" && (
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedCita(v);
                            setSelectedDate(v.fechaCita);
                            setSelectedTime(v.horaCita);
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
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal para reagendar */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 relative">
            <h2 className="text-lg font-semibold mb-4 text-[#1e3a8a]">
              Reagendar cita
            </h2>

            {/* Información de horarios */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-2">📅 Horario de atención:</p>
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
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-md w-full mb-3 px-3 py-2 focus:ring-2 focus:ring-[#37AADF]"
              required
            />

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nueva hora
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border border-gray-300 rounded-md w-full mb-4 px-3 py-2 focus:ring-2 focus:ring-[#37AADF]"
              required
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReagendar}
                className="px-4 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-[#2b4fc4] transition font-[Mitr]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
