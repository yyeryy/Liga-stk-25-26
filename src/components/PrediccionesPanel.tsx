import React, { useMemo, useState } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import ModalJugador from "./ModalJugador.tsx";

export const PrediccionesPanel = () => {
  const [modalShow, setModalShow] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Apodos | null>(
    null,
  );

  const prediccionData = useMemo(() => {
    const jornadasJugadas = data.jornadas.filter((j) =>
      j.resultados.some((r) => r.puntos > 0),
    ).length;

    const jornadasRestantes = 38 - jornadasJugadas;

    if (jornadasJugadas === 0) return { estado: "sin_datos" };
    if (jornadasRestantes <= 0) return { estado: "terminada" };

    const tablaGeneral = calcularAcumulado(1, 38);

    const inicioRacha = Math.max(1, jornadasJugadas - 4);
    const tablaRacha = calcularAcumulado(inicioRacha, jornadasJugadas);

    const activos = Object.values(Apodos).filter(
      (j) => j !== Apodos.Zarrakatz && j !== Apodos.Polfovich,
    );

    // 1. Calculamos la POSICIÓN ACTUAL respetando los empates (igual que en PagosPanel)
    const rankingActual = [...tablaGeneral]
      .filter(
        (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
      )
      .sort((a, b) => a.pago - b.pago);

    const posActualMap: Record<string, number> = {};
    let lastPagoAct: number | null = null;
    let lastPosAct = 0;
    rankingActual.forEach((j, idx) => {
      if (j.pago === lastPagoAct) {
        posActualMap[j.jugador] = lastPosAct; // Comparten posición si empatan a deuda
      } else {
        lastPosAct = idx + 1;
        lastPagoAct = j.pago;
        posActualMap[j.jugador] = lastPosAct;
      }
    });

    // 2. Procesamos el algoritmo del Oráculo
    const predicciones = activos.map((jugador) => {
      const statsActuales = tablaGeneral.find((j) => j.jugador === jugador) || {
        puntos: 0,
        pago: 0,
      };
      const statsRacha = tablaRacha.find((j) => j.jugador === jugador) || {
        puntos: 0,
        pago: 0,
      };

      const mediaHistPuntos = statsActuales.puntos / jornadasJugadas;
      const mediaHistPago = statsActuales.pago / jornadasJugadas;

      const numJornadasRacha = jornadasJugadas - inicioRacha + 1;
      const mediaRecPuntos = statsRacha.puntos / numJornadasRacha;

      const ratioMejora =
        mediaHistPuntos > 0 ? mediaRecPuntos / mediaHistPuntos : 1;

      const mediaProyPuntos = mediaHistPuntos * 0.7 + mediaRecPuntos * 0.3;
      const mediaProyPago = mediaHistPago * (1 / Math.max(0.5, ratioMejora));

      const prediccionPuntos = Math.round(
        statsActuales.puntos + mediaProyPuntos * jornadasRestantes,
      );
      const prediccionPago = Math.max(
        0,
        statsActuales.pago + mediaProyPago * jornadasRestantes,
      );

      let tendencia = "➖";
      let colorTendencia = "#95a5a6";
      if (mediaRecPuntos > mediaHistPuntos * 1.05) {
        tendencia = "🚀";
        colorTendencia = "#27ae60";
      } else if (mediaRecPuntos < mediaHistPuntos * 0.95) {
        tendencia = "📉";
        colorTendencia = "#e74c3c";
      }

      return {
        jugador,
        puntosActuales: statsActuales.puntos,
        prediccionPuntos,
        deudaActual: statsActuales.pago, // Aquí va el dato con todos sus decimales reales
        prediccionPago,
        tendencia,
        colorTendencia,
        posicionActual: posActualMap[jugador], // Posición empatada correcta
        posicionFinal: 0, // Se calculará en el siguiente paso
      };
    });

    // 3. Calculamos el RANKING FINAL respetando empates en las previsiones
    const rankingFinal = predicciones.sort(
      (a, b) =>
        a.prediccionPago - b.prediccionPago ||
        b.prediccionPuntos - a.prediccionPuntos,
    );

    let lastPagoFin: number | null = null;
    let lastPosFin = 0;
    rankingFinal.forEach((j, idx) => {
      // Redondeamos a 2 decimales solo para la comparación de empates finales
      const pagoComparar = Math.round(j.prediccionPago * 100) / 100;
      if (pagoComparar === lastPagoFin) {
        j.posicionFinal = lastPosFin;
      } else {
        lastPosFin = idx + 1;
        lastPagoFin = pagoComparar;
        j.posicionFinal = lastPosFin;
      }
    });

    return {
      estado: "ok",
      jornadasJugadas,
      jornadasRestantes,
      ranking: rankingFinal,
    };
  }, []);

  const handleAbrirModal = (jugador: Apodos) => {
    setJugadorSeleccionado(jugador);
    setModalShow(true);
  };

  if (prediccionData.estado === "sin_datos") {
    return (
      <div className="p-5 text-center text-muted">
        Aún no hay datos suficientes para predecir el futuro.
      </div>
    );
  }

  if (prediccionData.estado === "terminada") {
    return (
      <div className="p-5 text-center text-success fw-bold fs-4">
        ¡La liga ha terminado! Ya no hay nada que predecir.
      </div>
    );
  }

  const { jornadasJugadas, jornadasRestantes, ranking } = prediccionData;

  // Utilidad para pintar el número bonito (sin decimales .00, pero manteniendo los reales)
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
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: "15px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          padding: "20px 15px",
          border: "1px solid #0f3460",
          color: "white",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#e94560",
            marginBottom: "5px",
            fontSize: "1.8rem",
            fontWeight: "900",
            letterSpacing: "1px",
          }}
        >
          🔮 El Oráculo
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#a5b1c2",
            fontSize: "0.85rem",
            marginBottom: "25px",
          }}
        >
          Simulación de la J38 basada en historial y tendencias
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "rgba(255,255,255,0.05)",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "25px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ textAlign: "center", width: "45%" }}>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "#a5b1c2",
                fontWeight: "bold",
              }}
            >
              Jugadas
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "black",
                color: "#4cd137",
              }}
            >
              {jornadasJugadas}
            </div>
          </div>
          <div
            style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.2)" }}
          ></div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "#a5b1c2",
                fontWeight: "bold",
              }}
            >
              Restantes
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "black",
                color: "#e94560",
              }}
            >
              {jornadasRestantes}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "0 10px 10px 10px",
            color: "#a5b1c2",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          <div style={{ width: "12%", textAlign: "center" }}>Pos</div>
          <div style={{ width: "38%" }}>Jugador</div>
          <div style={{ width: "25%", textAlign: "center" }}>Puntos J38</div>
          <div style={{ width: "25%", textAlign: "right" }}>Deuda J38</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ranking?.map((j, idx) => {
            const difPos = j.posicionActual - j.posicionFinal;

            let difIcon = (
              <span
                style={{
                  color: "#7f8c8d",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                }}
              >
                =
              </span>
            );
            if (difPos > 0)
              difIcon = (
                <span
                  style={{
                    color: "#2ecc71",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                  }}
                >
                  +{difPos} ▲
                </span>
              );
            if (difPos < 0)
              difIcon = (
                <span
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                  }}
                >
                  {difPos} ▼
                </span>
              );

            return (
              <div
                key={j.jugador}
                onClick={() => handleAbrirModal(j.jugador as Apodos)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor:
                    idx === 0
                      ? "rgba(241, 196, 15, 0.15)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    idx === 0
                      ? "1px solid rgba(241, 196, 15, 0.5)"
                      : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                  padding: "12px 10px",
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div
                  style={{
                    width: "12%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: idx === 0 ? "#f1c40f" : "#a5b1c2",
                      fontSize: "1.1rem",
                      lineHeight: "1",
                    }}
                  >
                    {j.posicionFinal}
                  </span>
                  <div style={{ marginTop: "2px" }}>{difIcon}</div>
                </div>

                <div
                  style={{
                    width: "38%",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "5px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: idx === 0 ? "#f1c40f" : "#fff",
                      fontSize: "1rem",
                    }}
                  >
                    {j.jugador}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: j.colorTendencia,
                      marginTop: "2px",
                    }}
                  >
                    {j.tendencia} Tendencia
                  </span>
                </div>

                <div
                  style={{
                    width: "25%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "900",
                      color: "#4cd137",
                    }}
                  >
                    {j.prediccionPuntos}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#a5b1c2" }}>
                    Act: {j.puntosActuales}
                  </span>
                </div>

                <div
                  style={{
                    width: "25%",
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: j.prediccionPago > 0 ? "#ff4757" : "#2ed573",
                    }}
                  >
                    {formatEuros(j.prediccionPago)}€
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#a5b1c2" }}>
                    Act: {formatEuros(j.deudaActual)}€
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ModalJugador
        show={modalShow}
        onHide={() => setModalShow(false)}
        jugador={jugadorSeleccionado}
      />
    </div>
  );
};
