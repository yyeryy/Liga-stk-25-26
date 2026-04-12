import React, { useState } from "react";
import "./navbar.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { TiposVista } from "../models/models.ts";

interface NavBarProps {
  onSelect: (id: TiposVista) => void;
  vistaActual?: TiposVista; // Opcional: Sirve para resaltar la pestaña activa
}

const NavBar: React.FC<NavBarProps> = ({ onSelect, vistaActual }) => {
  // Estado para controlar si el menú hamburguesa está abierto en móviles
  const [expanded, setExpanded] = useState(false);

  // Función para cambiar de vista y cerrar el menú móvil automáticamente
  const handleSelect = (vista: TiposVista) => {
    onSelect(vista);
    setExpanded(false);
  };

  return (
    <Navbar
      expanded={expanded}
      sticky="top"
      expand="md"
      className="app-navbar shadow-sm py-2"
    >
      <Container>
        <Navbar.Brand className="fw-bold fs-4" aria-label="Liga STK">
          ⚽ Liga STK
        </Navbar.Brand>

        {/* Botón de hamburguesa para móviles */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          aria-label="Toggle navigation"
          onClick={() => setExpanded(!expanded)}
        />

        {/* Contenido colapsable */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {" "}
            {/* ms-auto empuja los enlaces a la derecha */}
            <Nav.Link
              active={vistaActual === TiposVista.Jornadas}
              aria-current={
                vistaActual === TiposVista.Jornadas ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Jornadas)}
              className="px-3"
            >
              📅 Jornadas
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Pagos}
              aria-current={
                vistaActual === TiposVista.Pagos ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Pagos)}
              className="px-3"
            >
              💸 Pagos
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Comida}
              aria-current={
                vistaActual === TiposVista.Comida ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Comida)}
              className="px-3"
            >
              🍽️ Comida
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Estadisticas}
              aria-current={
                vistaActual === TiposVista.Estadisticas ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Estadisticas)}
              className="px-3"
            >
              📊 Estadísticas
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Jugadores}
              aria-current={
                vistaActual === TiposVista.Jugadores ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Jugadores)}
              className="px-3"
            >
              👥 Jugadores
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Rachas}
              aria-current={
                vistaActual === TiposVista.Rachas ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Rachas)}
              className="px-3"
            >
              🔥 Rachas
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.CaraACara}
              aria-current={
                vistaActual === TiposVista.CaraACara ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.CaraACara)}
              className="px-3"
            >
              ⚔️ Cara a Cara
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Predicciones}
              aria-current={
                vistaActual === TiposVista.Predicciones ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Predicciones)}
              className="px-3"
            >
              🔮 Oráculo
            </Nav.Link>{" "}
            <Nav.Link
              active={vistaActual === TiposVista.ManagerMes}
              aria-current={
                vistaActual === TiposVista.ManagerMes ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.ManagerMes)}
              className="px-3"
            >
              🗓️ Mánager del Mes
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Evolucion}
              aria-current={
                vistaActual === TiposVista.Evolucion ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Evolucion)}
              className="px-3"
            >
              📈 Evolución
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Historico}
              aria-current={
                vistaActual === TiposVista.Historico ? "page" : undefined
              }
              onClick={() => handleSelect(TiposVista.Historico)}
              className="px-3"
            >
              🏆 Temporada 24-25
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
