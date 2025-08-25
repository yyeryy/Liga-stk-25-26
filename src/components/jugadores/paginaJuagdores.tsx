import React, { useState } from "react";
import { Col, ListGroup, Row, Card, Container } from "react-bootstrap";

interface Jugador {
  id: number;
  nombre: string;
  equipo: string;
  puntos: number;
  descripcion: string;
  imagen?: string;
}

const mockJugadores: Jugador[] = [
  { id: 1, nombre: "Yeray", equipo: "Steven", puntos: 15, descripcion: "Delantero estrella", imagen: "/imagenes/prueba.png" },  
  { id: 1, nombre: "Yeray", equipo: "STK A", puntos: 15, descripcion: "Delantero estrella", imagen: "/imagenes/prueba.png" },
  { id: 2, nombre: "Ana", equipo: "STK B", puntos: 20, descripcion: "Centrocampista rápido", imagen: "" },
  { id: 3, nombre: "Luis", equipo: "STK A", puntos: 10, descripcion: "Defensa sólido", imagen: "" },
  { id: 4, nombre: "Marta", equipo: "STK C", puntos: 18, descripcion: "Portera confiable", imagen: "" },
];

const JugadoresPanel: React.FC = () => {
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador>(mockJugadores[0]);

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "calc(100vh - 70px)" }}>
      <Row className="w-75">
        {/* Lista de jugadores */}
        <Col sm={4}>
          <ListGroup>
            {mockJugadores.map((j) => (
              <ListGroup.Item
                key={j.id}
                action
                active={jugadorSeleccionado.id === j.id}
                onClick={() => setJugadorSeleccionado(j)}
              >
                {j.nombre}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Ficha del jugador */}
        <Col sm={8}>
          <Card>
            {jugadorSeleccionado.imagen && (
              <Card.Img variant="top" src={jugadorSeleccionado.imagen} />
            )}
            <Card.Body>
              <Card.Title>{jugadorSeleccionado.nombre}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{jugadorSeleccionado.equipo}</Card.Subtitle>
              <Card.Text>
                {jugadorSeleccionado.descripcion}
              </Card.Text>
              <Card.Text>
                <strong>Puntos:</strong> {jugadorSeleccionado.puntos}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JugadoresPanel;
