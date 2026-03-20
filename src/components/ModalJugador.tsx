import React, { useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import { data } from "../data/data.ts";
import { Apodos } from "../models/models.ts";
import {
  calcularAcumulado,
  obtenerMaximos,
  obtenerMinimos,
} from "../utils/calcularAcumulado.ts";

// Importamos el modal de comparativa
import { ModalHeadToHead } from "./ModalHeadToHead.tsx";

interface ModalJugadorProps {
  show: boolean;
  onHide: () => void;
  jugador: Apodos | null;
}

const ModalJugador: React.FC<ModalJugadorProps> = ({
  show,
  onHide,
  jugador,
}) => {
  // Estado para abrir el Cara a Cara
  const [showHeadToHead, setShowHeadToHead] = useState(false);

  const statsJugador = useMemo(() => {
    if (!jugador) return null;

    const tablaGeneral = calcularAcumulado(1, 38, true);

    const tablaActivos = tablaGeneral.filter(
      (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
    );

    const tablaOrdenadaPorPago = [...tablaActivos].sort(
      (a, b) => a.pago - b.pago,
    );

    let lastPago: number | null = null;
    let lastPos = 0;
    tablaOrdenadaPorPago.forEach((j, idx) => {
      if (j.pago === lastPago) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPago = j.pago;
        j.posicion = lastPos;
      }
    });

    let datosGenerales = tablaOrdenadaPorPago.find(
      (j) => j.jugador === jugador,
    );
    let posicionFinal: number | string = datosGenerales?.posicion ?? "-";

    if (!datosGenerales) {
      datosGenerales = tablaGeneral.find((j) => j.jugador === jugador);
    }

    if (!datosGenerales) return null;

    let mejorJ = { jornada: 0, puntos: -1 };
    let peorJ = { jornada: 0, puntos: 9999 };

    data.jornadas.forEach((jornada) => {
      const resultadoJugador = jornada.resultados.find(
        (r) => r.jugador === jugador,
      );
      if (resultadoJugador) {
        if (resultadoJugador.puntos > mejorJ.puntos) {
          mejorJ = { jornada: jornada.numero, puntos: resultadoJugador.puntos };
        }
        if (resultadoJugador.puntos < peorJ.puntos) {
          peorJ = { jornada: jornada.numero, puntos: resultadoJugador.puntos };
        }
      }
    });

    let posPuntos: number | string = "-";
    let posMejor: number | string = "-";
    let posPeor: number | string = "-";

    if (jugador !== Apodos.Zarrakatz && jugador !== Apodos.Polfovich) {
      posPuntos =
        tablaActivos.filter((j) => j.puntos > datosGenerales!.puntos).length +
        1;

      const maximos = obtenerMaximos();
      const minimos = obtenerMinimos();
      const activos = Object.keys(maximos).filter(
        (k) => k !== Apodos.Zarrakatz && k !== Apodos.Polfovich,
      );

      const myMax = maximos[jugador as Apodos];
      posMejor = activos.filter((k) => maximos[k as Apodos] > myMax).length + 1;

      const myMin = minimos[jugador as Apodos];
      posPeor = activos.filter((k) => minimos[k as Apodos] > myMin).length + 1;
    }

    return {
      totalPagado: datosGenerales.pago,
      totalPuntos: datosGenerales.puntos,
      posicionGlobal: posicionFinal,
      posPuntos,
      mejorJornada: mejorJ.puntos !== -1 ? mejorJ : null,
      posMejor,
      peorJornada: peorJ.puntos !== 9999 ? peorJ : null,
      posPeor,
    };
  }, [jugador]);

  if (!jugador) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Expediente de {jugador}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {!statsJugador ? (
            <p className="text-center text-muted my-4">
              No se han encontrado datos para este jugador.
            </p>
          ) : (
            <ListGroup variant="flush">
              {/* Deuda / Ranking Principal */}
              <ListGroup.Item className="p-0 d-flex align-items-stretch">
                <div className="p-3 flex-grow-1">
                  <div className="fw-bold text-dark">
                    Total a pagar acumulado
                  </div>
                  <div
                    className="text-muted mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Deuda histórica de la temporada
                  </div>
                  <Badge bg="danger" pill className="fs-6">
                    {statsJugador.totalPagado.toFixed(2)} €
                  </Badge>
                </div>
                <div
                  className="bg-light d-flex flex-column align-items-center justify-content-center border-start px-3 text-dark"
                  style={{ minWidth: "90px" }}
                >
                  <span
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      letterSpacing: "1px",
                    }}
                  >
                    Ranking
                  </span>
                  <span className="fs-3 fw-bold">
                    #{statsJugador.posicionGlobal}
                  </span>
                </div>
              </ListGroup.Item>

              {/* Puntos Totales */}
              <ListGroup.Item className="p-0 d-flex align-items-stretch">
                <div className="p-3 flex-grow-1">
                  <div className="fw-bold text-dark">Puntos Totales</div>
                  <div
                    className="text-muted mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Rendimiento general
                  </div>
                  <Badge bg="primary" pill className="fs-6">
                    {statsJugador.totalPuntos} pts
                  </Badge>
                </div>
                {statsJugador.posPuntos !== "-" && (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center border-start px-3 text-secondary"
                    style={{ minWidth: "90px" }}
                  >
                    <span className="fs-4 fw-bold">
                      #{statsJugador.posPuntos}
                    </span>
                  </div>
                )}
              </ListGroup.Item>

              {/* Mejor Jornada */}
              {statsJugador.mejorJornada && (
                <ListGroup.Item className="p-0 d-flex align-items-stretch">
                  <div className="p-3 flex-grow-1">
                    <div className="fw-bold text-success">
                      🌟 Mejor Jornada (J{statsJugador.mejorJornada.jornada})
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Consiguió {statsJugador.mejorJornada.puntos} puntos.
                    </div>
                  </div>
                  {statsJugador.posMejor !== "-" && (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center border-start px-3 text-success"
                      style={{ minWidth: "90px", opacity: 0.85 }}
                    >
                      <span className="fs-4 fw-bold">
                        #{statsJugador.posMejor}
                      </span>
                    </div>
                  )}
                </ListGroup.Item>
              )}

              {/* Peor Jornada */}
              {statsJugador.peorJornada && (
                <ListGroup.Item className="p-0 d-flex align-items-stretch">
                  <div className="p-3 flex-grow-1">
                    <div className="fw-bold text-danger">
                      📉 Peor Jornada (J{statsJugador.peorJornada.jornada})
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Su mínimo fue de {statsJugador.peorJornada.puntos} puntos.
                    </div>
                  </div>
                  {statsJugador.posPeor !== "-" && (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center border-start px-3 text-danger"
                      style={{ minWidth: "90px", opacity: 0.85 }}
                    >
                      <span className="fs-4 fw-bold">
                        #{statsJugador.posPeor}
                      </span>
                    </div>
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="outline-primary"
            onClick={() => setShowHeadToHead(true)}
          >
            ⚔️ Cara a Cara
          </Button>

          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de comparativa superpuesto */}
      <ModalHeadToHead
        show={showHeadToHead}
        onHide={() => setShowHeadToHead(false)}
        jugadorA={jugador}
      />
    </>
  );
};

export default ModalJugador;
