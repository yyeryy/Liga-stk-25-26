import React, { useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import { data } from "../data/data.ts";
import { Apodos } from "../models/models.ts";
// Importamos tu función core para reutilizar toda la lógica de negocio
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

interface ModalJugadorProps {
  show: boolean;
  onHide: () => void;
  jugador: Apodos | null; // Usamos tu Enum
}

const ModalJugador: React.FC<ModalJugadorProps> = ({
  show,
  onHide,
  jugador,
}) => {
  // Usamos useMemo para que esto solo se calcule cuando se abra el modal
  // o cambie el jugador, y no en cada pequeño renderizado.
  const statsJugador = useMemo(() => {
    if (!jugador) return null;

    // 1. Obtenemos la tabla general de toda la temporada
    const tablaGeneral = calcularAcumulado(1, 38, true);

    // NUEVO: Filtramos a los desertores/bajas para el ranking oficial
    const tablaActivos = tablaGeneral.filter(
      (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
    );

    // 2. Ordenamos solo a los activos por dinero (de menos a más)
    const tablaOrdenadaPorPago = [...tablaActivos].sort(
      (a, b) => a.pago - b.pago,
    );

    // 3. Asignamos las posiciones reales gestionando empates
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

    // 4. Buscamos al jugador en la tabla de activos
    let datosGenerales = tablaOrdenadaPorPago.find(
      (j) => j.jugador === jugador,
    );
    let posicionFinal: number | string = datosGenerales?.posicion ?? "-";

    // Si no está en los activos (porque es Zarrakatz o Polfovich), rescatamos sus datos de la general
    if (!datosGenerales) {
      datosGenerales = tablaGeneral.find((j) => j.jugador === jugador);
    }

    if (!datosGenerales) return null;

    // 5. Buscamos la mejor y peor jornada "en crudo" (solo puntos)
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

    return {
      totalPagado: datosGenerales.pago,
      totalPuntos: datosGenerales.puntos,
      posicionGlobal: posicionFinal, // Mostrará su número real, o "-" si están fuera de ranking
      mejorJornada: mejorJ.puntos !== -1 ? mejorJ : null,
      peorJornada: peorJ.puntos !== 9999 ? peorJ : null,
    };
  }, [jugador]);

  if (!jugador) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>Expediente de {jugador}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!statsJugador ? (
          <p className="text-center text-muted my-3">
            No se han encontrado datos para este jugador.
          </p>
        ) : (
          <ListGroup variant="flush">
            {/* Posición global en la liga */}
            <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
              <span className="fw-bold">Posición en la Liga</span>
              <Badge bg="dark" className="fs-6">
                #{statsJugador.posicionGlobal}
              </Badge>
            </ListGroup.Item>

            {/* Dinero Total */}
            <ListGroup.Item className="d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                <div className="fw-bold">Total a pagar acumulado</div>
                Deuda histórica de la temporada
              </div>
              <Badge bg="danger" pill className="fs-6">
                {statsJugador.totalPagado.toFixed(2)} €
              </Badge>
            </ListGroup.Item>

            {/* Puntos Totales */}
            <ListGroup.Item className="d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                <div className="fw-bold">Puntos Totales</div>
                Rendimiento general
              </div>
              <Badge bg="primary" pill className="fs-6">
                {statsJugador.totalPuntos} pts
              </Badge>
            </ListGroup.Item>

            {/* Mejor Jornada */}
            {statsJugador.mejorJornada && (
              <ListGroup.Item>
                <div className="fw-bold text-success">
                  🌟 Mejor Jornada (J{statsJugador.mejorJornada.jornada})
                </div>
                Consiguió {statsJugador.mejorJornada.puntos} puntos.
              </ListGroup.Item>
            )}

            {/* Peor Jornada */}
            {statsJugador.peorJornada && (
              <ListGroup.Item>
                <div className="fw-bold text-danger">
                  📉 Peor Jornada (J{statsJugador.peorJornada.jornada})
                </div>
                Un desastre: {statsJugador.peorJornada.puntos} puntos.
              </ListGroup.Item>
            )}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalJugador;
