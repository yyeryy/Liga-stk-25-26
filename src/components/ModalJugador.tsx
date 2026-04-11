import React, { useMemo } from "react";
import "./ModalJugador.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

interface ModalJugadorProps {
  show: boolean;
  onHide: () => void;
  jugador: Apodos | null;
}

export const ModalJugador: React.FC<ModalJugadorProps> = (props) => {
  const expediente = useMemo(() => {
    if (!props.jugador) return null;

    // 1. Datos acumulados generales
    const tablaGeneral = calcularAcumulado(1, 38, true);
    const activos = tablaGeneral.filter(
      (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
    );
    const playerStats = tablaGeneral.find((j) => j.jugador === props.jugador);
    const rankingPuntos = [...activos].sort((a, b) => b.puntos - a.puntos);
    const rankingPagos = [...activos].sort((a, b) => a.pago - b.pago);

    const posPuntos =
      rankingPuntos.findIndex((j) => j.jugador === props.jugador) + 1;
    const posPagos =
      rankingPagos.findIndex((j) => j.jugador === props.jugador) + 1;

    // 2. Cálculo de medias (promedios)
    const jornadasDelJugador = data.jornadas.filter((j) =>
      j.resultados.some(
        (res) => res.jugador === props.jugador && res.puntos > 0,
      ),
    );
    const totalPuntosRaw = jornadasDelJugador.reduce((sum, j) => {
      const res = j.resultados.find((r) => r.jugador === props.jugador);
      return sum + (res?.puntos || 0);
    }, 0);

    const totalJornadasJugadas = jornadasDelJugador.length;
    const promedioPuntos =
      totalJornadasJugadas > 0 ? totalPuntosRaw / totalJornadasJugadas : 0;
    const promedioPago =
      totalJornadasJugadas > 0
        ? (playerStats?.pago || 0) / totalJornadasJugadas
        : 0;

    // 3. CONTEXTO GLOBAL PARA LAS INSIGNIAS (Roast)
    const maxPagoTotal = Math.max(...activos.map((j) => j.pago), 0);

    // Encontrar al holder del récord de la vergüenza
    let recordMinHolder = { jugador: "", puntos: Infinity, jornada: 0 };
    data.jornadas.forEach((jornada) => {
      if (!jornada.resultados.some((res) => res.puntos > 0)) return; // Ignoramos si no se jugó
      jornada.resultados.forEach((r) => {
        if (
          r.jugador !== Apodos.Zarrakatz &&
          r.jugador !== Apodos.Polfovich &&
          r.puntos < recordMinHolder.puntos
        ) {
          recordMinHolder = {
            jugador: r.jugador,
            puntos: r.puntos,
            jornada: jornada.numero,
          };
        }
      });
    });

    // Form reciente para la racha Titanic
    const ultimas3Jugadas = jornadasDelJugador
      .sort((a, b) => b.numero - a.numero)
      .slice(0, 3)
      .map((jornada) => {
        // Necesitamos calcular el pago de esa jornada específica
        const resAcum = calcularAcumulado(jornada.numero, jornada.numero);
        const statsJor = resAcum.find((r) => r.jugador === props.jugador);
        return statsJor?.pago || 0;
      });
    const isTitanic =
      ultimas3Jugadas.length === 3 && ultimas3Jugadas.every((pago) => pago > 0);

    // 4. LÓGICA DE INSIGNIAS DINÁMICAS (The Roast Machine)
    const listInsignias = [];

    // Insignia: Farolillo Rojo 🕯️
    if (posPuntos === activos.length) {
      listInsignias.push({
        icon: "🕯️",
        title: "👑 Farolillo Rojo",
        color: "var(--danger)",
        desc: "Sotanero profesional. No se cansa de buscar petróleo en el fondo de la tabla.",
      });
    }

    // Insignia: Cajero Automático 💸
    if (playerStats && playerStats.pago === maxPagoTotal && maxPagoTotal > 0) {
      listInsignias.push({
        icon: "💸",
        title: "🏦 Cajero Automático",
        color: "var(--gold)",
        desc: "Patrocinador oficial de las cenas Biwinger. Gracias por tu contribución financiera.",
      });
    }

    // Insignia: Titanic 📉
    if (isTitanic) {
      listInsignias.push({
        icon: "🚢",
        title: "🚢 Titanic",
        color: "var(--text)",
        desc: "En caída libre. Ha pagado multa en sus últimas 3 jornadas disputadas seguidas.",
      });
    }

    // Insignia: Récord Vergüenza 🗑️
    if (recordMinHolder.jugador === props.jugador) {
      listInsignias.push({
        icon: "🗑️",
        title: "🤏 Récord Vergüenza",
        color: "var(--muted-2)",
        desc: `Ostenta la PEOR puntuación histórica (${recordMinHolder.puntos} pts, J${recordMinHolder.jornada}) en una sola jornada.`,
      });
    }

    // Insignia: Gris Marengo (El mediocre) 📎
    if (activos.length > 5 && posPuntos > 3 && posPuntos < activos.length - 2) {
      listInsignias.push({
        icon: "😐",
        title: "📎 Gris Marengo",
        color: "var(--muted-2)",
        desc: "Ni sube ni baja. Ni gana ni pierde. El rey de la mediocridad absoluta.",
      });
    }

    return {
      jugador: props.jugador,
      puntosTotales: playerStats?.puntos || 0,
      pagoTotal: playerStats?.pago || 0,
      posPuntos,
      posPagos,
      promedioPuntos,
      promedioPago,
      totalJornadasJugadas,
      insignias: listInsignias,
    };
  }, [props.jugador]);

  if (!expediente) return null;

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="modal-expediente"
    >
      <Modal.Body className="modal-body-panel">
        {/* CABECERA (Foto y Nombre) */}
        <div className="modal-header-info">
          <img
            src={`../imagenes/${props.jugador}.jpg`}
            alt={props.jugador || ""}
            className="profile-img"
            onError={(e) => (e.currentTarget.src = "../imagenes/spinner.jpg")}
          />
          <div>
            <h1 className="player-name">{props.jugador}</h1>
            <p className="player-subtitle">Expediente Temporada 23/24</p>
          </div>
        </div>

        {/* --- NUEVO: SECCIÓN INSIGNIAS --- */}
        {expediente.insignias.length > 0 && (
          <div className="mb-3">
            <h6 className="section-title">Muro de la Vergüenza</h6>
            <div className="insignias-grid">
              {expediente.insignias.map((ins) => (
                <div
                  key={ins.title}
                  className="insignia"
                  style={{
                    backgroundColor: `${ins.color}10`,
                    border: `1px solid ${ins.color}30`,
                  }}
                >
                  <div className="icon">{ins.icon}</div>
                  <div>
                    <div
                      className="insignia-title"
                      style={{ color: ins.color }}
                    >
                      {ins.title}
                    </div>
                    <div className="insignia-desc">{ins.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN ESTADÍSTICAS */}
        <h6 className="section-title">Estadísticas Clave</h6>
        <Row className="g-3 mb-3">
          {/* Tarjeta Puntos */}
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-number">#{expediente.posPuntos}</div>
              <div className="stat-label">Ranking Pts</div>
              <div className="stat-sub">
                Total: {expediente.puntosTotales} pts
              </div>
            </div>
          </Col>
          {/* Tarjeta Pagos */}
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div
                className={`stat-number ${expediente.pagoTotal > 0 ? "debt-negative" : "debt-positive"}`}
              >
                {expediente.pagoTotal.toFixed(0)}€
              </div>
              <div className="stat-label">Deuda Total</div>
              <div className="stat-sub">
                Multas: #{expediente.posPagos} ranking
              </div>
            </div>
          </Col>
          {/* Tarjeta Media Puntos */}
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-number">
                {expediente.promedioPuntos.toFixed(1)}
              </div>
              <div className="stat-label">Media Pts/J</div>
              <div className="stat-sub">
                en {expediente.totalJornadasJugadas} jornadas
              </div>
            </div>
          </Col>
          {/* Tarjeta Media Multa */}
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div
                className={`stat-number ${expediente.promedioPago > 0 ? "debt-negative" : "debt-positive"}`}
              >
                {expediente.promedioPago.toFixed(1)}€
              </div>
              <div className="stat-label">Media €/J</div>
              <div className="stat-sub">promedio multa</div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" onClick={props.onHide} className="btn-full">
          Cerrar Expediente
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
