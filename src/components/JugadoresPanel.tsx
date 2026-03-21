import React, { useMemo, useState } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// --- FUNCIÓN HELPER: Genera el expediente del jugador ---
const generarExpedienteUltra = (jugador: Apodos) => {
  // 1. Datos acumulados generales
  const tablaGeneral = calcularAcumulado(1, 38, true);
  const activos = tablaGeneral.filter(
    (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
  );
  const playerStats = tablaGeneral.find((j) => j.jugador === jugador);
  const rankingPuntos = [...activos].sort((a, b) => b.puntos - a.puntos);
  const rankingPagos = [...activos].sort((a, b) => a.pago - b.pago);

  const posPuntos = rankingPuntos.findIndex((j) => j.jugador === jugador) + 1;
  const posPagos = rankingPagos.findIndex((j) => j.jugador === jugador) + 1;

  // 2. Cálculo de medias
  const jornadasDelJugador = data.jornadas.filter((j) =>
    j.resultados.some((res) => res.jugador === jugador && res.puntos > 0),
  );

  const ultimasResultadosSorted = [...jornadasDelJugador].sort(
    (a, b) => b.numero - a.numero,
  );

  let totalPuntosRaw = 0;

  jornadasDelJugador.forEach((jornada) => {
    const res = jornada.resultados.find((r) => r.jugador === jugador);
    if (res) totalPuntosRaw += res.puntos;
  });

  const totalJornadasJugadas = jornadasDelJugador.length;
  const promedioPuntos =
    totalJornadasJugadas > 0 ? totalPuntosRaw / totalJornadasJugadas : 0;
  const promedioPago =
    totalJornadasJugadas > 0
      ? (playerStats?.pago || 0) / totalJornadasJugadas
      : 0;

  // 3. CONTEXTO GLOBAL PARA LAS INSIGNIAS
  const maxPagoTotal = Math.max(...activos.map((j) => j.pago), 0);
  const minPagoTotal = Math.min(...activos.map((j) => j.pago));

  let recordMinHolder = { jugador: "", puntos: Infinity, jornada: 0 };
  data.jornadas.forEach((jornada) => {
    if (!jornada.resultados.some((res) => res.puntos > 0)) return;
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

  // Racha Titanic
  const formRecientePagos = ultimasResultadosSorted.slice(0, 3).map((j) => {
    const resAcum = calcularAcumulado(j.numero, j.numero);
    return resAcum.find((r) => r.jugador === jugador)?.pago || 0;
  });
  const isTitanic =
    formRecientePagos.length === 3 &&
    formRecientePagos.every((pago) => pago > 0);

  // On Fire (Top 1 en la última jornada)
  const ultimaJornadaDisputada = ultimasResultadosSorted[0];
  let isOnFire = false;
  if (ultimaJornadaDisputada) {
    const resAcumUltima = calcularAcumulado(
      ultimaJornadaDisputada.numero,
      ultimaJornadaDisputada.numero,
    );
    const statsUltima = resAcumUltima.find((r) => r.jugador === jugador);
    if (statsUltima && statsUltima.posicion === 1) isOnFire = true;
  }

  const isReyAhorro =
    playerStats && playerStats.pago === minPagoTotal && playerStats.pago === 0;

  // 4. LÓGICA DE INSIGNIAS DINÁMICAS (Equilibrio perfecto de salseo)
  const listInsignias = [];
  const totalActivos = activos.length;

  // Positivas
  if (isOnFire) {
    listInsignias.push({
      icon: "🔥",
      title: "On Fire!",
      color: "#e67e22",
      desc: "Viene de quedar Top 1 en la última jornada.",
    });
  }
  if (isReyAhorro) {
    listInsignias.push({
      icon: "🛡️",
      title: "Rey del Ahorro",
      color: "#2ecc71",
      desc: "Cartera blindada. No debe ni un solo euro a la liga.",
    });
  }

  // Roast
  if (posPuntos === activos.length) {
    listInsignias.push({
      icon: "🕯️",
      title: "Farolillo Rojo",
      color: "#e74c3c",
      desc: "Sotanero profesional. Cierra la clasificación.",
    });
  }
  if (playerStats && playerStats.pago === maxPagoTotal && maxPagoTotal > 0) {
    listInsignias.push({
      icon: "💸",
      title: "Cajero Automático",
      color: "#f1c40f",
      desc: "Patrocinador oficial de las multas. Gracias por tanto.",
    });
  }
  if (isTitanic) {
    listInsignias.push({
      icon: "🚢",
      title: "Titanic",
      color: "#34495e",
      desc: "Caída libre. Ha pagado multa en sus 3 últimas jornadas.",
    });
  }
  if (recordMinHolder.jugador === jugador) {
    listInsignias.push({
      icon: "🗑️",
      title: "Récord Vergüenza",
      color: "#95a5a6",
      desc: `Peor puntuación histórica absoluta (${recordMinHolder.puntos} pts).`,
    });
  }

  // CORRECCIÓN: Lógica estricta para Gris Marengo (Mediocritat absoluta) 📎
  // Concepto: El mediocre es exclusivo. Si no tienes insignia roast, ni positiva...
  // pero TAMBIÉN debes estar matemáticamente en el medio de todo.
  if (listInsignias.length === 0 && totalActivos > 5) {
    // Condition A: Middle points rank (not top 3, not bottom 2)
    const isMiddlePointsRank = posPuntos > 3 && posPuntos <= totalActivos - 2;
    // Condition B: Average debt (has debt, but not top 3 owe-rs)
    const hasAverageDebt =
      playerStats!.pago > 0 && posPagos > 3 && posPagos < totalActivos - 2;

    if (isMiddlePointsRank && hasAverageDebt) {
      listInsignias.push({
        icon: "😐",
        title: "Gris Marengo",
        color: "#bdc3c7",
        desc: "La mediocridad perfecta. Ni gana ni pierde, puntúa average, paga promedio. Un fantasma.",
      });
    }
  }

  return {
    jugador,
    puntosTotales: playerStats?.puntos || 0,
    pagoTotal: playerStats?.pago || 0,
    posPuntos,
    posPagos,
    promedioPuntos,
    promedioPago,
    totalJornadasJugadas,
    insignias: listInsignias,
  };
};

export const JugadoresPanel = () => {
  const [expandedPlayer, setExpandedPlayer] = useState<Apodos | null>(null);

  const listaJugadores = useMemo(() => {
    return Object.values(Apodos).filter(
      (j) => j !== Apodos.Zarrakatz && j !== Apodos.Polfovich,
    );
  }, []);

  const handleToggle = (jugador: Apodos) => {
    setExpandedPlayer(expandedPlayer === jugador ? null : jugador);
  };

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  return (
    <div
      style={{
        padding: "10px",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          padding: "20px 15px",
          border: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "5px",
            fontSize: "1.5rem",
          }}
        >
          👥 Directorio
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "0.85rem",
            marginBottom: "25px",
          }}
        >
          Toca en un jugador para desplegar su expediente
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {listaJugadores.map((jugador) => {
            const isExpanded = expandedPlayer === jugador;
            const expediente = isExpanded
              ? generarExpedienteUltra(jugador)
              : null;

            return (
              <div
                key={jugador}
                style={{
                  border: `1px solid ${isExpanded ? "#3498db" : "#eee"}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  backgroundColor: isExpanded ? "#fbfdff" : "#fff",
                  boxShadow: isExpanded
                    ? "0 5px 15px rgba(52, 152, 219, 0.1)"
                    : "none",
                }}
              >
                {/* CABECERA DE LA FILA */}
                <div
                  onClick={() => handleToggle(jugador)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        backgroundColor: "#f8f9fa",
                        color: "#a5b1c2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        border: "1px solid #eee",
                      }}
                    >
                      👤
                    </div>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#2c3e50",
                        fontSize: "1.1rem",
                      }}
                    >
                      {jugador}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      color: isExpanded ? "#3498db" : "#bdc3c7",
                      transition: "transform 0.3s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </div>
                </div>

                {/* CONTENIDO DESPLEGABLE */}
                <div
                  style={{
                    maxHeight: isExpanded ? "1000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease-in-out",
                    borderTop: isExpanded ? "1px solid #eee" : "none",
                  }}
                >
                  {expediente && (
                    <div style={{ padding: "20px" }}>
                      {/* --- SECCIÓN INSIGNIAS --- */}
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
                            Vitrina de Insignias
                          </h6>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
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
                                  backgroundColor: `${ins.color}10`,
                                  border: `1px solid ${ins.color}30`,
                                  padding: "12px",
                                  borderRadius: "10px",
                                }}
                              >
                                <div
                                  style={{ fontSize: "1.8rem", lineHeight: 1 }}
                                >
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

                      {/* SECCIÓN ESTADÍSTICAS (Las 4 tarjetas bonitas originales) */}
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
                      <Row className="g-3">
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
                              {expediente.puntosTotales} pts
                            </div>
                          </div>
                        </Col>
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
                                color:
                                  expediente.pagoTotal > 0
                                    ? "#e74c3c"
                                    : "#27ae60",
                                lineHeight: 1,
                              }}
                            >
                              {formatEuros(expediente.pagoTotal)}€
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
                              #{expediente.posPagos} en multas
                            </div>
                          </div>
                        </Col>
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
                              {expediente.totalJornadasJugadas} jornadas
                            </div>
                          </div>
                        </Col>
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
                                color:
                                  expediente.promedioPago > 0
                                    ? "#e74c3c"
                                    : "#27ae60",
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
                              de multa
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
