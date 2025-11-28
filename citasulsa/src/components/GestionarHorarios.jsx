import { useState, useEffect } from "react";
import { horariosAPI, usuariosAPI } from "../services/api";
import { showSuccess, showError, showWarning, showLoading, closeLoading } from "../utils/alerts";
import { PlusIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";

const DIAS_SEMANA = [
  { id: 0, nombre: "Lunes" },
  { id: 1, nombre: "Martes" },
  { id: 2, nombre: "Miércoles" },
  { id: 3, nombre: "Jueves" },
  { id: 4, nombre: "Viernes" },
  { id: 5, nombre: "Sábado" },
  { id: 6, nombre: "Domingo" }
];

export default function GestionarHorarios() {
  const [coordinadores, setCoordinadores] = useState([]);
  const [coordinadorSeleccionado, setCoordinadorSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    Dia_Semana: 0,
    Hora_Inicio: "",
    Hora_Fin: "",
    Tipo: "libre",
    Descripcion: ""
  });

  // Cargar coordinadores al montar el componente
  useEffect(() => {
    cargarCoordinadores();
  }, []);

  // Cargar horarios cuando se selecciona un coordinador
  useEffect(() => {
    if (coordinadorSeleccionado) {
      cargarHorarios();
    }
  }, [coordinadorSeleccionado]);

  const cargarCoordinadores = async () => {
    try {
      showLoading("Cargando coordinadores...");
      const usuarios = await usuariosAPI.getAll();
      const coords = usuarios.filter(u => u.Rol === "admin_escuela");
      setCoordinadores(coords);
      closeLoading();
    } catch (error) {
      closeLoading();
      console.error("Error al cargar coordinadores:", error);
      showError("Error al cargar coordinadores: " + error.message);
    }
  };

  const cargarHorarios = async () => {
    try {
      showLoading("Cargando horarios...");
      const data = await horariosAPI.getByUsuario(coordinadorSeleccionado.Id);
      setHorarios(data);
      closeLoading();
    } catch (error) {
      closeLoading();
      showError("Error al cargar horarios: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coordinadorSeleccionado) {
      showWarning("Por favor selecciona un coordinador");
      return;
    }

    if (!formData.Hora_Inicio || !formData.Hora_Fin) {
      showWarning("Por favor completa las horas de inicio y fin");
      return;
    }

    try {
      showLoading("Guardando horario...");
      
      // Agregar segundos al formato de hora (el backend espera HH:MM:SS)
      const horarioData = {
        Usuario_Id: coordinadorSeleccionado.Id,
        Dia_Semana: formData.Dia_Semana,
        Hora_Inicio: formData.Hora_Inicio + ":00",
        Hora_Fin: formData.Hora_Fin + ":00",
        Tipo: formData.Tipo,
        Descripcion: formData.Descripcion || null
      };
      
      await horariosAPI.create(horarioData);
      
      await showSuccess("Horario agregado exitosamente");
      setShowModal(false);
      resetForm();
      cargarHorarios();
    } catch (error) {
      showError("Error al guardar horario: " + error.message);
    } finally {
      closeLoading();
    }
  };

  const handleDelete = async (horarioId) => {
    const confirmacion = await showWarning(
      "¿Estás seguro de que deseas eliminar este horario?",
      "Confirmar eliminación",
      true
    );
    
    if (confirmacion.isConfirmed) {
      try {
        showLoading("Eliminando horario...");
        await horariosAPI.delete(horarioId);
        await showSuccess("Horario eliminado exitosamente");
        cargarHorarios();
      } catch (error) {
        showError("Error al eliminar horario: " + error.message);
      } finally {
        closeLoading();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      Dia_Semana: 0,
      Hora_Inicio: "",
      Hora_Fin: "",
      Tipo: "libre",
      Descripcion: ""
    });
  };

  const agruparHorariosPorDia = () => {
    const horariosPorDia = {};
    DIAS_SEMANA.forEach(dia => {
      horariosPorDia[dia.id] = horarios.filter(h => h.Dia_Semana === dia.id);
    });
    return horariosPorDia;
  };

  const horariosPorDia = agruparHorariosPorDia();

  return (
    <main className="flex-1 p-8 bg-[#f9fafb] min-h-screen font-[Mitr]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1e3a8a]">Gestionar Horarios de Coordinadores</h1>
          <p className="text-gray-600 mt-2">Asigna horarios libres y ocupados a los coordinadores</p>
        </div>

        {/* Selector de coordinador */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Seleccionar Coordinador
          </label>
          <select
            value={coordinadorSeleccionado?.Id || ""}
            onChange={(e) => {
              const coord = coordinadores.find(c => c.Id === e.target.value);
              setCoordinadorSeleccionado(coord);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
          >
            <option value="">-- Selecciona un coordinador --</option>
            {coordinadores.map(coord => (
              <option key={coord.Id} value={coord.Id}>
                {coord.Nombre} {coord.Apellido_Paterno} {coord.Apellido_Materno} - {coord.Area}
              </option>
            ))}
          </select>
        </div>

        {/* Contenido principal */}
        {coordinadorSeleccionado && (
          <>
            {/* Botón para agregar horario */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-3 rounded-lg hover:bg-[#152d6b] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Agregar Horario
              </button>
            </div>

            {/* Tabla de horarios por día */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia.id} className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg text-[#1e3a8a] mb-3 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      {dia.nombre}
                    </h3>
                    {horariosPorDia[dia.id].length === 0 ? (
                      <p className="text-gray-400 text-sm italic">Sin horarios asignados</p>
                    ) : (
                      <div className="space-y-2">
                        {horariosPorDia[dia.id]
                          .sort((a, b) => a.Hora_Inicio.localeCompare(b.Hora_Inicio))
                          .map(horario => (
                            <div
                              key={horario.Id}
                              className={`p-3 rounded-lg border-l-4 ${
                                horario.Tipo === "libre"
                                  ? "bg-green-50 border-green-500"
                                  : "bg-red-50 border-red-500"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">
                                    {horario.Hora_Inicio.substring(0, 5)} - {horario.Hora_Fin.substring(0, 5)}
                                  </p>
                                  <p className={`text-xs font-medium ${
                                    horario.Tipo === "libre" ? "text-green-700" : "text-red-700"
                                  }`}>
                                    {horario.Tipo === "libre" ? "🟢 Libre" : "🔴 Ocupado"}
                                  </p>
                                  {horario.Descripcion && (
                                    <p className="text-xs text-gray-600 mt-1">{horario.Descripcion}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDelete(horario.Id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Modal para agregar horario */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Agregar Horario</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Día de la semana
                  </label>
                  <select
                    value={formData.Dia_Semana}
                    onChange={(e) => setFormData({ ...formData, Dia_Semana: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  >
                    {DIAS_SEMANA.map(dia => (
                      <option key={dia.id} value={dia.id}>{dia.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Hora inicio
                    </label>
                    <input
                      type="time"
                      value={formData.Hora_Inicio}
                      onChange={(e) => setFormData({ ...formData, Hora_Inicio: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Hora fin
                    </label>
                    <input
                      type="time"
                      value={formData.Hora_Fin}
                      onChange={(e) => setFormData({ ...formData, Hora_Fin: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo de horario
                  </label>
                  <select
                    value={formData.Tipo}
                    onChange={(e) => setFormData({ ...formData, Tipo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  >
                    <option value="libre">🟢 Libre (disponible para citas)</option>
                    <option value="ocupado">🔴 Ocupado (clase/otra actividad)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.Descripcion}
                    onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                    placeholder="Ej: Clase de Matemáticas, Junta, etc."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    maxLength={100}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#152d6b] transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
