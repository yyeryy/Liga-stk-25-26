import React, { useMemo, useState } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./JugadoresPanel.css";

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
      color: "var(--orange)",
      desc: "Viene de quedar Top 1 en la última jornada.",
    });
  }
  if (isReyAhorro) {
    listInsignias.push({
      icon: "🛡️",
      title: "Rey del Ahorro",
      color: "var(--color-success)",
      desc: "Cartera blindada. No debe ni un solo euro a la liga.",
    });
  }

  // Roast
  if (posPuntos === activos.length) {
    listInsignias.push({
      icon: "🕯️",
      title: "Farolillo Rojo",
      color: "var(--color-danger)",
      desc: "Sotanero profesional. Cierra la clasificación.",
    });
  }
  if (playerStats && playerStats.pago === maxPagoTotal && maxPagoTotal > 0) {
    listInsignias.push({
      icon: "💸",
      title: "Cajero Automático",
      color: "var(--color-warning)",
      desc: "Patrocinador oficial de las multas. Gracias por tanto.",
    });
  }
  if (isTitanic) {
    listInsignias.push({
      icon: "🚢",
      title: "Titanic",
      color: "var(--color-text)",
      desc: "Caída libre. Ha pagado multa en sus 3 últimas jornadas.",
    });
  }
  if (recordMinHolder.jugador === jugador) {
    listInsignias.push({
      icon: "🗑️",
      title: "Récord Vergüenza",
      color: "var(--color-muted)",
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
        color: "var(--color-muted)",
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
    <div className="jugadores-panel">
      <div className="panel jugadores-content panel-screen">
        <h2 className="h2">👥 Directorio</h2>
        <p className="text-muted jugadores-subtitle">
          Toca en un jugador para desplegar su expediente
        </p>

        <div className="jugadores-list">
          {listaJugadores.map((jugador) => {
            const isExpanded = expandedPlayer === jugador;
            const expediente = isExpanded
              ? generarExpedienteUltra(jugador)
              : null;
            const safeId = String(jugador).replace(/\s+/g, "-");
            return (
              <div
                key={jugador}
                className={`jugador-row ${isExpanded ? "jugador-row--expanded" : ""}`}
              >
                {/* CABECERA DE LA FILA */}
                <div
                  onClick={() => handleToggle(jugador)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggle(jugador);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={`collapse-${safeId}`}
                  className="jugador-header"
                >
                  <div className="jugador-left">
                    <div className="jugador-avatar">👤</div>
                    <div className="jugador-name">{jugador}</div>
                  </div>
                  <div
                    className={`jugador-toggle ${isExpanded ? "jugador-toggle--expanded" : ""}`}
                    aria-hidden="true"
                  >
                    ▼
                  </div>
                </div>

                {/* CONTENIDO DESPLEGABLE */}
                <div
                  id={`collapse-${safeId}`}
                  className={`jugador-collapse ${isExpanded ? "jugador-collapse--open" : ""}`}
                >
                  {expediente && (
                    <div className="jugador-collapse-inner">
                      {/* --- SECCIÓN INSIGNIAS --- */}
                      {expediente.insignias.length > 0 && (
                        <div
                          className="insignias-section"
                          style={{ marginBottom: "25px" }}
                        >
                          <h6 className="section-title">
                            Vitrina de Insignias
                          </h6>
                          <div className="insignias-grid">
                            {expediente.insignias.map((ins) => (
                              <div
                                key={ins.title}
                                className="insignia-card"
                                style={{ borderColor: ins.color }}
                              >
                                <div
                                  className="insignia-icon"
                                  style={{ color: ins.color }}
                                >
                                  {ins.icon}
                                </div>
                                <div>
                                  <div
                                    className="insignia-title"
                                    style={{ color: ins.color }}
                                  >
                                    {ins.title}
                                  </div>
                                  <div className="insignia-desc">
                                    {ins.desc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SECCIÓN ESTADÍSTICAS (Las 4 tarjetas bonitas originales) */}
                      <h6 className="section-title">Estadísticas Clave</h6>
                      <Row className="g-3 stats-grid">
                        <Col xs={6} md={3}>
                          <div className="stat-card">
                            <div className="stat-value">
                              #{expediente.posPuntos}
                            </div>
                            <div
                              className="stat-label"
                              style={{ color: "var(--accent)" }}
                            >
                              Ranking Pts
                            </div>
                            <div className="stat-sub">
                              {expediente.puntosTotales} pts
                            </div>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="stat-card">
                            <div
                              className={`stat-value ${expediente.pagoTotal > 0 ? "stat-value--debt" : "stat-value--ok"}`}
                            >
                              {formatEuros(expediente.pagoTotal)}€
                            </div>
                            <div className="stat-label">Deuda Total</div>
                            <div className="stat-sub">
                              #{expediente.posPagos} en multas
                            </div>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="stat-card">
                            <div className="stat-value">
                              {expediente.promedioPuntos.toFixed(1)}
                            </div>
                            <div className="stat-label">Media Pts/J</div>
                            <div className="stat-sub">
                              {expediente.totalJornadasJugadas} jornadas
                            </div>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="stat-card">
                            <div
                              className={`stat-value ${expediente.promedioPago > 0 ? "stat-value--debt" : "stat-value--ok"}`}
                            >
                              {expediente.promedioPago.toFixed(1)}€
                            </div>
                            <div className="stat-label">Media €/J</div>
                            <div className="stat-sub">de multa</div>
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
