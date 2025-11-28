import { useState, useEffect } from "react";
import { horariosAreasAPI } from "../services/api";
import { showSuccess, showError, showWarning, showConfirm, showLoading, closeLoading } from "../utils/alerts";

export default function GestionarHorariosAreas() {
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    Dia_Semana: "",
    Hora_Inicio: "",
    Hora_Fin: "",
    Tipo: "libre",
    Descripcion: ""
  });

  // Lista de áreas disponibles
  const areas = [
    "Biblioteca",
    "Laboratorios",
    "Talleres",
    "Cafetería",
    "Instalaciones Deportivas",
    "Áreas Comunes",
    "Arquitectura y Diseño",
    "Ciencias Sociales y Humanidades",
    "Negocios y Economía",
    "Ciencias de la Salud",
    "Turismo y Gastronomía",
    "Ingenierías",
    "Rectoría",
    "Control Escolar",
    "Servicios Escolares",
    "Admisiones",
    "Caja / Pagos",
    "Otra área"
  ];

  const diasSemana = [
    { value: 0, label: "Lunes" },
    { value: 1, label: "Martes" },
    { value: 2, label: "Miércoles" },
    { value: 3, label: "Jueves" },
    { value: 4, label: "Viernes" },
    { value: 5, label: "Sábado" },
    { value: 6, label: "Domingo" }
  ];

  const cargarHorarios = async (area) => {
    if (!area) {
      setHorarios([]);
      return;
    }

    try {
      setLoading(true);
      const data = await horariosAreasAPI.getByArea(area);
      setHorarios(data);
    } catch (error) {
      console.error("Error al cargar horarios:", error);
      showError("Error al cargar los horarios del área");
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (e) => {
    const area = e.target.value;
    setAreaSeleccionada(area);
    cargarHorarios(area);
  };

  const abrirModalNuevo = () => {
    if (!areaSeleccionada) {
      showWarning("Por favor selecciona un área primero");
      return;
    }
    setHorarioEditando(null);
    setFormData({
      Dia_Semana: "",
      Hora_Inicio: "",
      Hora_Fin: "",
      Tipo: "libre",
      Descripcion: ""
    });
    setShowModal(true);
  };

  const abrirModalEditar = (horario) => {
    setHorarioEditando(horario);
    setFormData({
      Dia_Semana: horario.Dia_Semana,
      Hora_Inicio: horario.Hora_Inicio.substring(0, 5),
      Hora_Fin: horario.Hora_Fin.substring(0, 5),
      Tipo: horario.Tipo,
      Descripcion: horario.Descripcion || ""
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setHorarioEditando(null);
    setFormData({
      Dia_Semana: "",
      Hora_Inicio: "",
      Hora_Fin: "",
      Tipo: "libre",
      Descripcion: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Dia_Semana || !formData.Hora_Inicio || !formData.Hora_Fin) {
      showWarning("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar que hora fin sea mayor que hora inicio
    if (formData.Hora_Fin <= formData.Hora_Inicio) {
      showWarning("La hora de fin debe ser mayor que la hora de inicio");
      return;
    }

    try {
      showLoading(horarioEditando ? "Actualizando horario..." : "Creando horario...");
      setLoading(true);

      const horarioData = {
        Area: areaSeleccionada,
        Dia_Semana: parseInt(formData.Dia_Semana),
        Hora_Inicio: formData.Hora_Inicio,
        Hora_Fin: formData.Hora_Fin,
        Tipo: formData.Tipo,
        Descripcion: formData.Descripcion || null
      };

      if (horarioEditando) {
        await horariosAreasAPI.update(horarioEditando.Id, horarioData);
        await showSuccess("Horario actualizado correctamente");
      } else {
        await horariosAreasAPI.create(horarioData);
        await showSuccess("Horario creado correctamente");
      }

      cerrarModal();
      await cargarHorarios(areaSeleccionada);
    } catch (error) {
      console.error("Error al guardar horario:", error);
      closeLoading();
      showError(error.message || "Error al guardar el horario");
    } finally {
      setLoading(false);
      closeLoading();
    }
  };

  const handleEliminar = async (horario) => {
    const result = await showConfirm(
      `¿Estás seguro de eliminar el horario del ${diasSemana[horario.Dia_Semana].label}?`,
      "Esta acción no se puede deshacer"
    );

    if (!result.isConfirmed) return;

    try {
      showLoading("Eliminando horario...");
      await horariosAreasAPI.delete(horario.Id);
      closeLoading();
      await showSuccess("Horario eliminado correctamente");
      await cargarHorarios(areaSeleccionada);
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      closeLoading();
      showError("Error al eliminar el horario");
    }
  };

  // Agrupar horarios por día
  const horariosAgrupados = horarios.reduce((acc, horario) => {
    const dia = horario.Dia_Semana;
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(horario);
    return acc;
  }, {});

  return (
    <div className="bg-white shadow-lg p-8 rounded-2xl">
      <h2 className="text-2xl mb-6 text-[#20232b] font-[Mitr]">
        Gestionar Horarios de Áreas
      </h2>

      <p className="text-gray-600 mb-6">
        Configura los horarios de atención para cada área de la universidad
      </p>

      {/* Selector de área */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona un área
        </label>
        <select
          value={areaSeleccionada}
          onChange={handleAreaChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-md shadow-sm focus:ring-2 focus:ring-[#37AADF] focus:border-[#37AADF]"
        >
          <option value="">-- Selecciona un área --</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Botón agregar */}
      {areaSeleccionada && (
        <div className="mb-6">
          <button
            onClick={abrirModalNuevo}
            className="bg-[#1e3a8a] text-white px-4 py-2 rounded-md hover:bg-[#2b4fc4] transition font-[Mitr]"
          >
            + Agregar Horario
          </button>
        </div>
      )}

      {/* Tabla de horarios */}
      {areaSeleccionada && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Horarios de {areaSeleccionada}
          </h3>

          {loading ? (
            <div className="text-center p-8">
              <p className="text-gray-500">Cargando horarios...</p>
            </div>
          ) : horarios.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-500">
                No hay horarios configurados para esta área
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Haz clic en "Agregar Horario" para crear el primer horario
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {diasSemana.map((dia) => {
                const horariosDelDia = horariosAgrupados[dia.value] || [];
                if (horariosDelDia.length === 0) return null;

                return (
                  <div
                    key={dia.value}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {dia.label}
                    </h4>
                    <div className="space-y-2">
                      {horariosDelDia.map((horario) => (
                        <div
                          key={horario.Id}
                          className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              {horario.Hora_Inicio.substring(0, 5)} -{" "}
                              {horario.Hora_Fin.substring(0, 5)}
                            </span>
                            <span
                              className={`ml-3 px-2 py-1 rounded text-xs font-semibold ${
                                horario.Tipo === "libre"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {horario.Tipo}
                            </span>
                            {horario.Descripcion && (
                              <p className="text-sm text-gray-600 mt-1">
                                {horario.Descripcion}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => abrirModalEditar(horario)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(horario)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar horario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[500px]">
            <h3 className="text-xl font-semibold mb-4 text-[#1e3a8a]">
              {horarioEditando ? "Editar Horario" : "Nuevo Horario"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Día de la semana */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de la semana <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.Dia_Semana}
                  onChange={(e) =>
                    setFormData({ ...formData, Dia_Semana: e.target.value })
                  }
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  required
                >
                  <option value="">Selecciona un día</option>
                  {diasSemana.map((dia) => (
                    <option key={dia.value} value={dia.value}>
                      {dia.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hora inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.Hora_Inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, Hora_Inicio: e.target.value })
                  }
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  required
                />
              </div>

              {/* Hora fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.Hora_Fin}
                  onChange={(e) =>
                    setFormData({ ...formData, Hora_Fin: e.target.value })
                  }
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de horario
                </label>
                <select
                  value={formData.Tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, Tipo: e.target.value })
                  }
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="libre">Libre</option>
                  <option value="ocupado">Ocupado</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.Descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, Descripcion: e.target.value })
                  }
                  rows={3}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  placeholder="Ej: Horario de atención al público"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-[#2b4fc4] transition font-[Mitr] disabled:bg-gray-400"
                >
                  {horarioEditando ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
