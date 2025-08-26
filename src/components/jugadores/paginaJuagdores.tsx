import React, { useEffect, useState } from "react";
import { Col, ListGroup, Row, Card, Container, Button } from "react-bootstrap";
import { supabase } from '../../supabase.js';
import { Jugador } from "../../models/models.js";

const JugadoresPanel: React.FC = () => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador | null>(null);

  const fetchJugadores = async () => {
  const { data, error } = await supabase
    .from('jugadores')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    const jugadoresMapeados: Jugador[] = data.map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      apodo: item.apodo,
      puntos: item.puntos,
      descripcion: item.descripcion,
      imagen: item.rutaImagen || '',
    }));

    setJugadores(jugadoresMapeados);
    setJugadorSeleccionado(jugadoresMapeados[0])
  }
};


  useEffect(() => {
    fetchJugadores();

  }, []);

  // Guardar datos en el servi

  if (!jugadorSeleccionado) return <div>Cargando...</div>;

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "calc(100vh - 70px)" }}>
      <Row className="w-75">
        <Col sm={4}>
          <ListGroup>
            {jugadores.map((j) => (
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
        <Col sm={8}>
          <Card>
            {jugadorSeleccionado.imagen && (
              <Card.Img variant="top" src={jugadorSeleccionado.imagen} />
            )}
            <Card.Body>
              <Card.Title>{jugadorSeleccionado.nombre}</Card.Title>
              <Card.Subtitle><strong>Alias: </strong>{jugadorSeleccionado.apodo}</Card.Subtitle>
              <Card.Text><strong>Descripcion: </strong>{jugadorSeleccionado.descripcion}</Card.Text>
              <Card.Text><strong>Puntos: </strong> {jugadorSeleccionado.puntos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JugadoresPanel;
