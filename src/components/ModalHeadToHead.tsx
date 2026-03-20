import React, { useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

interface ModalHeadToHeadProps {
  show: boolean;
  onHide: () => void;
  jugadorA: Apodos | null;
}

export const ModalHeadToHead: React.FC<ModalHeadToHeadProps> = ({
  show,
  onHide,
  jugadorA,
}) => {
  const [jugadorB, setJugadorB] = React.useState<Apodos | null>(null);

  const jugadoresDisponibles = Object.values(Apodos).filter(
    (j) => j !== jugadorA,
  );

  const comparativa = useMemo(() => {
    if (!jugadorA || !jugadorB) return null;

    const tablaGeneralA = calcularAcumulado(1, 38, true);

    const activosA = tablaGeneralA.filter(
      (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
    );

    const ordenadaA = [...activosA].sort((a, b) => b.puntos - a.puntos);

    let lastPuntos: number | null = null;
    let lastPos = 0;
    ordenadaA.forEach((j, idx) => {
      if (j.puntos === lastPuntos) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPuntos = j.puntos;
        j.posicion = lastPos;
      }
    });

    const datosA = tablaGeneralA.find((j) => j.jugador === jugadorA);
    const datosB = tablaGeneralA.find((j) => j.jugador === jugadorB);
    const posA = ordenadaA.find((j) => j.jugador === jugadorA)?.posicion ?? "-";
    const posB = ordenadaA.find((j) => j.jugador === jugadorB)?.posicion ?? "-";

    let victoriasA = 0;
    let victoriasB = 0;
    let empates = 0;

    data.jornadas.forEach((jornada) => {
      if (jornada.resultados.every((r) => r.puntos === 0)) return;

      const resA = jornada.resultados.find((r) => r.jugador === jugadorA);
      const resB = jornada.resultados.find((r) => r.jugador === jugadorB);

      if (resA && resB) {
        if (resA.puntos > resB.puntos) {
          victoriasA++;
        } else if (resB.puntos > resA.puntos) {
          victoriasB++;
        } else {
          empates++;
        }
      }
    });

    return {
      datosA,
      datosB,
      posA,
      posB,
      score: {
        A: victoriasA,
        B: victoriasB,
        E: empates,
      },
    };
  }, [jugadorA, jugadorB]);

  const handleClose = () => {
    setJugadorB(null);
    onHide();
  };

  if (!jugadorA) return null;

  const difPuntos = comparativa
    ? Math.abs(
        (comparativa.datosA?.puntos || 0) - (comparativa.datosB?.puntos || 0),
      )
    : 0;
  const lider =
    comparativa &&
    (comparativa.datosA?.puntos || 0) >= (comparativa.datosB?.puntos || 0)
      ? comparativa.datosA?.jugador
      : comparativa?.datosB?.jugador;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>⚔️ Cara a Cara: {jugadorA} vs ...</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form.Group className="mb-4 d-flex align-items-center gap-3 bg-light p-3 rounded">
          <Form.Label className="mb-0 fw-bold">Comparar con:</Form.Label>
          <Form.Select
            value={jugadorB || ""}
            onChange={(e) => setJugadorB(e.target.value as Apodos)}
            style={{
              maxWidth: "250px",
              borderColor: "#0d6efd",
              fontWeight: "600",
            }}
          >
            <option value="">Elige un rival</option>
            {jugadoresDisponibles.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {!comparativa ? (
          <div className="text-center text-muted p-5 bg-white rounded shadow-sm border">
            <h3>Pique Sano™</h3>
            <p>
              Elige un amigo arriba para ver quién va por delante en puntos.
            </p>
          </div>
        ) : (
          <Row className="g-4">
            {/* Jugador A (Fijo) */}
            <Col
              xs={12}
              md={5}
              className="text-center p-4 bg-white rounded shadow-sm border"
            >
              <span className="fs-1">🧔</span>
              <h3 className="mt-2 text-dark">{comparativa.datosA?.jugador}</h3>
              <Badge bg="dark" className="fs-6 mt-1 mb-3">
                # {comparativa.posA} en liga
              </Badge>

              <div className="d-flex justify-content-around mt-3">
                <div className="text-primary">
                  <div className="fs-3 fw-bold">
                    {comparativa.datosA?.puntos} pts
                  </div>
                  <small className="text-muted">Total puntos</small>
                </div>
                <div className="text-danger opacity-75">
                  <div className="fs-5 fw-bold">
                    {comparativa.datosA?.pago.toFixed(2)}€
                  </div>
                  <small className="text-muted">Deuda</small>
                </div>
              </div>
            </Col>

            {/* Marcador Central */}
            <Col
              xs={12}
              md={2}
              className="d-flex flex-column align-items-center justify-content-center bg-primary text-white rounded p-3 shadow-sm"
              style={{ minWidth: "150px" }}
            >
              {/* Bloque Diferencia de Puntos */}
              <div
                className="text-white-50 text-uppercase fw-bold"
                style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
              >
                Diferencia
              </div>
              <div className="fs-3 fw-bolder mt-1 mb-0">{difPuntos} pts</div>
              <div
                className="text-white text-center lh-1 mb-3 mt-1"
                style={{ fontSize: "0.85rem" }}
              >
                a favor de
                <br />{" "}
                <span className="text-warning fw-bold d-inline-block mt-1">
                  {lider}
                </span>
              </div>

              <hr className="w-100 my-2 border-white opacity-25" />

              {/* Bloque Jornadas Ganadas (AHORA MÁS GRANDE) */}
              <div className="mt-1 text-center w-100">
                <div
                  className="text-white-50 text-uppercase fw-bold mb-1"
                  style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                >
                  Jornadas ganadas
                </div>
                <div className="fw-bolder fs-2 my-1 lh-1">
                  {comparativa.score.A} - {comparativa.score.B}
                </div>
                {comparativa.score.E > 0 && (
                  <div className="text-white-50" style={{ fontSize: "0.7rem" }}>
                    ({comparativa.score.E} empates)
                  </div>
                )}
              </div>
            </Col>

            {/* Jugador B (Rival) */}
            <Col
              xs={12}
              md={5}
              className="text-center p-4 bg-white rounded shadow-sm border"
            >
              <span className="fs-1">🧔</span>
              <h3 className="mt-2 text-dark">{comparativa.datosB?.jugador}</h3>
              <Badge bg="dark" className="fs-6 mt-1 mb-3">
                # {comparativa.posB} en liga
              </Badge>

              <div className="d-flex justify-content-around mt-3">
                <div className="text-primary">
                  <div className="fs-3 fw-bold">
                    {comparativa.datosB?.puntos} pts
                  </div>
                  <small className="text-muted">Total puntos</small>
                </div>
                <div className="text-danger opacity-75">
                  <div className="fs-5 fw-bold">
                    {comparativa.datosB?.pago.toFixed(2)}€
                  </div>
                  <small className="text-muted">Deuda</small>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar Pique
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
