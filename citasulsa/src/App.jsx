import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Login from "./components/login";
import Bienvda from "./components/Bienvda";
import Agregar from "./components/Agregar";
import Consultar from "./components/Consultar";
import Reagendar from "./components/Reagendar";
import Navbar from "./components/Navbar";
import Topbar from "./components/TopBar";
import Admin from "./components/Admin";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleNavbar = () => setIsOpen(!isOpen);
  const [visitantes, setVisitantes] = useState([]);

  // 🔹 Función para verificar si hay sesión
  const isAuthenticated = () => !!localStorage.getItem("rol");

  // 🔹 Función para obtener el rol actual
  const getRol = () => localStorage.getItem("rol");

  // 🔹 Layout principal con navbar lateral y topbar superior
  const PageLayout = ({ children }) => (
    <div className="flex">
      <Navbar isOpen={isOpen} toggleNavbar={toggleNavbar} />
      <div className="flex-1 md:ml-64 bg-[#f9fafb] min-h-screen pt-14">
        <Topbar toggleNavbar={toggleNavbar} />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  // 🔹 Ruta protegida según el rol
  const RutaProtegida = ({ children, rolesPermitidos }) => {
    const rol = getRol();

    if (!isAuthenticated()) return <Navigate to="/" replace />;
    if (rolesPermitidos && !rolesPermitidos.includes(rol))
      return <Navigate to="/bienvda" replace />;

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route path="/" element={<Login />} />

        {/* Páginas accesibles según el rol */}
        <Route
          path="/bienvda"
          element={
            <RutaProtegida
              rolesPermitidos={[
                "admin_sistema",
                "admin_universitario",
                "guardia",
              ]}
            >
              <PageLayout>
                <Bienvda />
              </PageLayout>
            </RutaProtegida>
          }
        />

        <Route
          path="/agregar"
          element={
            <RutaProtegida
              rolesPermitidos={["admin_sistema", "admin_universitario"]}
            >
              <PageLayout>
                <Agregar
                  visitantes={visitantes}
                  setVisitantes={setVisitantes}
                />
              </PageLayout>
            </RutaProtegida>
          }
        />

        <Route
          path="/consultar"
          element={
            <RutaProtegida
              rolesPermitidos={[
                "admin_sistema",
                "admin_universitario",
                "guardia",
              ]}
            >
              <PageLayout>
                <Consultar
                  visitantes={visitantes}
                  setVisitantes={setVisitantes}
                />
              </PageLayout>
            </RutaProtegida>
          }
        />

        <Route
          path="/reagendar"
          element={
            <RutaProtegida
              rolesPermitidos={["admin_sistema", "admin_universitario"]}
            >
              <PageLayout>
                <Reagendar />
              </PageLayout>
            </RutaProtegida>
          }
        />

        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={["admin_sistema"]}>
              <PageLayout>
                <Admin />
              </PageLayout>
            </RutaProtegida>
          }
        />

        {/* Si no hay coincidencias, redirige a login */}
        <Route path="*" element={<Navigate to="/bienvda" />} />
      </Routes>
    </Router>
  );
};

export default App;
