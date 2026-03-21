import React, { useMemo } from "react";
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
        color: "#e74c3c",
        desc: "Sotanero profesional. No se cansa de buscar petróleo en el fondo de la tabla.",
      });
    }

    // Insignia: Cajero Automático 💸
    if (playerStats && playerStats.pago === maxPagoTotal && maxPagoTotal > 0) {
      listInsignias.push({
        icon: "💸",
        title: "🏦 Cajero Automático",
        color: "#f1c40f",
        desc: "Patrocinador oficial de las cenas Biwinger. Gracias por tu contribución financiera.",
      });
    }

    // Insignia: Titanic 📉
    if (isTitanic) {
      listInsignias.push({
        icon: "🚢",
        title: "🚢 Titanic",
        color: "#34495e",
        desc: "En caída libre. Ha pagado multa en sus últimas 3 jornadas disputadas seguidas.",
      });
    }

    // Insignia: Récord Vergüenza 🗑️
    if (recordMinHolder.jugador === props.jugador) {
      listInsignias.push({
        icon: "🗑️",
        title: "🤏 Récord Vergüenza",
        color: "#95a5a6",
        desc: `Ostenta la PEOR puntuación histórica (${recordMinHolder.puntos} pts, J${recordMinHolder.jornada}) en una sola jornada.`,
      });
    }

    // Insignia: Gris Marengo (El mediocre) 📎
    if (activos.length > 5 && posPuntos > 3 && posPuntos < activos.length - 2) {
      listInsignias.push({
        icon: "😐",
        title: "📎 Gris Marengo",
        color: "#bdc3c7",
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
      <Modal.Body
        style={{
          padding: "25px",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          borderRadius: "15px",
        }}
      >
        {/* CABECERA (Foto y Nombre) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "25px",
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: "15px",
          }}
        >
          <img
            src={`../imagenes/${props.jugador}.jpg`}
            alt={props.jugador || ""}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #f8f9fa",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
            onError={(e) => (e.currentTarget.src = "../imagenes/spinner.jpg")}
          />
          <div>
            <h1
              style={{
                margin: 0,
                fontWeight: "black",
                color: "#2c3e50",
                fontSize: "1.8rem",
                letterSpacing: "-1px",
              }}
            >
              {props.jugador}
            </h1>
            <p
              style={{
                margin: 0,
                color: "#7f8c8d",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              Expediente Temporada 23/24
            </p>
          </div>
        </div>

        {/* --- NUEVO: SECCIÓN INSIGNIAS --- */}
        {expediente.insignias.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h6
              style={{
                textTransform: "uppercase",
                color: "#b2bec3",
                fontSize: "0.75rem",
                fontWeight: "900",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              Muro de la Vergüenza
            </h6>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "10px",
              }}
            >
              {expediente.insignias.map((ins) => (
                <div
                  key={ins.title}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    backgroundColor: `${ins.color}10`, // Color sutil de fondo
                    border: `1px solid ${ins.color}30`,
                    padding: "12px",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>
                    {ins.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: ins.color,
                        fontSize: "0.95rem",
                      }}
                    >
                      {ins.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#7f8c8d",
                        marginTop: "1px",
                        lineHeight: "1.2",
                      }}
                    >
                      {ins.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN ESTADÍSTICAS */}
        <h6
          style={{
            textTransform: "uppercase",
            color: "#b2bec3",
            fontSize: "0.75rem",
            fontWeight: "900",
            letterSpacing: "1px",
            marginBottom: "12px",
          }}
        >
          Estadísticas Clave
        </h6>
        <Row className="g-3" style={{ marginBottom: "25px" }}>
          {/* Tarjeta Puntos */}
          <Col xs={6} md={3}>
            <div
              style={{
                textAlign: "center",
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #eee",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "black",
                  color: "#2c3e50",
                  lineHeight: 1,
                }}
              >
                #{expediente.posPuntos}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  color: "#3498db",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                Ranking Pts
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#7f8c8d",
                  marginTop: "2px",
                }}
              >
                Total: {expediente.puntosTotales} pts
              </div>
            </div>
          </Col>
          {/* Tarjeta Pagos */}
          <Col xs={6} md={3}>
            <div
              style={{
                textAlign: "center",
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #eee",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "black",
                  color: expediente.pagoTotal > 0 ? "#e74c3c" : "#27ae60",
                  lineHeight: 1,
                }}
              >
                {expediente.pagoTotal.toFixed(0)}€
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  color: "#7f8c8d",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                Deuda Total
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#7f8c8d",
                  marginTop: "2px",
                }}
              >
                Multas: #{expediente.posPagos} ranking
              </div>
            </div>
          </Col>
          {/* Tarjeta Media Puntos */}
          <Col xs={6} md={3}>
            <div
              style={{
                textAlign: "center",
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #eee",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "black",
                  color: "#2c3e50",
                  lineHeight: 1,
                  marginTop: "2px",
                }}
              >
                {expediente.promedioPuntos.toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  color: "#7f8c8d",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                Media Pts/J
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#7f8c8d",
                  marginTop: "2px",
                }}
              >
                en {expediente.totalJornadasJugadas} jornadas
              </div>
            </div>
          </Col>
          {/* Tarjeta Media Multa */}
          <Col xs={6} md={3}>
            <div
              style={{
                textAlign: "center",
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #eee",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "black",
                  color: expediente.promedioPago > 0 ? "#e74c3c" : "#27ae60",
                  lineHeight: 1,
                  marginTop: "2px",
                }}
              >
                {expediente.promedioPago.toFixed(1)}€
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  color: "#7f8c8d",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                Media €/J
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#7f8c8d",
                  marginTop: "2px",
                }}
              >
                promedio multa
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer
        style={{
          border: "none",
          padding: "0 25px 25px 25px",
          background: "#fff",
        }}
      >
        <Button
          variant="secondary"
          onClick={props.onHide}
          style={{
            width: "100%",
            borderRadius: "10px",
            fontWeight: "bold",
            padding: "10px",
          }}
        >
          Cerrar Expediente
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
