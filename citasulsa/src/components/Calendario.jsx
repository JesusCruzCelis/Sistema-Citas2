import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
export default function Calendario() {
  const [fecha, setFecha] = useState(new Date());
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
      {" "}
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Calendario</h1>{" "}
      <Calendar
        onChange={setFecha}
        value={fecha}
        className="bg-white rounded-lg shadow-md p-4"
      />{" "}
    </div>
  );
}
