import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { TiposVista } from '../models/models.ts';

interface NavBarProps {
  onSelect: (id: TiposVista) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSelect }) => {
  return (
    <Navbar bg="success" variant="dark" fixed="top">
      <Container>
        <Navbar.Brand>Liga STK</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link onClick={() => onSelect(TiposVista.Inicio)}>Inicio</Nav.Link>
          <Nav.Link onClick={() => onSelect(TiposVista.Jugadores)}>Jugadores</Nav.Link>
          <Nav.Link onClick={() => onSelect(TiposVista.Pagos)}>Configuración</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
