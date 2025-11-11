import { useState, useEffect } from "react";

export default function Consultar() {
  const [visitantes, setVisitantes] = useState([]);
  const [visitantesFiltrados, setVisitantesFiltrados] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 🔹 Cargar los registros guardados en localStorage
  useEffect(() => {
    const visitasGuardadas = JSON.parse(localStorage.getItem("visitas")) || [];
    setVisitantes(visitasGuardadas);
    setVisitantesFiltrados(visitasGuardadas); // Mostrar todos al inicio
  }, []);

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
  const handleReagendar = () => {
    const nuevasVisitas = [...visitantes];
    nuevasVisitas[selectedIndex].fechaCita = selectedDate;
    nuevasVisitas[selectedIndex].horaCita = selectedTime;

    // Guardar de nuevo en localStorage
    localStorage.setItem("visitas", JSON.stringify(nuevasVisitas));
    setVisitantes(nuevasVisitas);

    // Actualizar filtro actual
    if (mesSeleccionado !== "") {
      const mesNumero = obtenerNumeroMes(mesSeleccionado);
      const filtrados = nuevasVisitas.filter((v) => {
        const fecha = new Date(v.fechaCita);
        return fecha.getMonth() + 1 === mesNumero;
      });
      setVisitantesFiltrados(filtrados);
    } else {
      setVisitantesFiltrados(nuevasVisitas);
    }

    // Cerrar modal
    setShowModal(false);
    alert("✅ Cita reagendada correctamente");
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
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#1e3a8a] text-white">
            <th className="p-3">Nombre visitante</th>
            <th className="p-3">Fecha de cita</th>
            <th className="p-3">Hora</th>
            <th className="p-3">Área visitada</th>
            <th className="p-3">Medio de ingreso</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visitantesFiltrados.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No hay registros en este mes
              </td>
            </tr>
          ) : (
            visitantesFiltrados.map((v, i) => (
              <tr key={i} className="hover:bg-gray-100 border-b">
                <td className="p-3">{v.nombre}</td>
                <td className="p-3">{v.fechaCita}</td>
                <td className="p-3">{v.horaCita}</td>
                <td className="p-3">{v.area}</td>
                <td className="p-3">{v.medio}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedIndex(i);
                      setSelectedDate(v.fechaCita);
                      setSelectedTime(v.horaCita);
                      setShowModal(true);
                    }}
                    className="bg-[#1e3a8a] text-white px-3 py-1 rounded-md shadow hover:bg-[#2b4fc4] transition font-[Mitr]"
                  >
                    Reagendar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal para reagendar */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 relative">
            <h2 className="text-lg font-semibold mb-4 text-[#1e3a8a]">
              Reagendar cita
            </h2>

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nueva fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md w-full mb-3 px-3 py-2 focus:ring-2 focus:ring-[#37AADF]"
            />

            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nueva hora
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border border-gray-300 rounded-md w-full mb-4 px-3 py-2 focus:ring-2 focus:ring-[#37AADF]"
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
