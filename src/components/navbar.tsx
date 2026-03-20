import React, { useState } from "react";
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
      bg="success" // Si quieres un verde más oscuro prueba con style={{ backgroundColor: '#198754' }}
      variant="dark"
      fixed="top"
      expand="md" // Hace que el menú colapse en pantallas pequeñas
      className="shadow-sm py-2" // Sombra sutil y un pelín más de altura
    >
      <Container>
        <Navbar.Brand className="fw-bold fs-4">⚽ Liga STK</Navbar.Brand>

        {/* Botón de hamburguesa para móviles */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        />

        {/* Contenido colapsable */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {" "}
            {/* ms-auto empuja los enlaces a la derecha */}
            <Nav.Link
              active={vistaActual === TiposVista.Jornadas}
              onClick={() => handleSelect(TiposVista.Jornadas)}
              className="px-3"
            >
              📅 Jornadas
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Pagos}
              onClick={() => handleSelect(TiposVista.Pagos)}
              className="px-3"
            >
              💸 Pagos
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Estadisticas}
              onClick={() => handleSelect(TiposVista.Estadisticas)}
              className="px-3"
            >
              📊 Estadísticas
            </Nav.Link>
            <Nav.Link
              active={vistaActual === TiposVista.Rachas}
              onClick={() => handleSelect(TiposVista.Rachas)}
              className="px-3"
            >
              🔥 Rachas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
