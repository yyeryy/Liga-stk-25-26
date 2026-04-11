import { useMemo } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import "./PrediccionesPanel.css";

export const PrediccionesPanel = () => {
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

    // 1. Calculamos la POSICIÓN ACTUAL respetando los empates
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
        posActualMap[j.jugador] = lastPosAct;
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
      let colorTendencia = "var(--muted-2)";
      if (mediaRecPuntos > mediaHistPuntos * 1.05) {
        tendencia = "🚀";
        colorTendencia = "var(--success)";
      } else if (mediaRecPuntos < mediaHistPuntos * 0.95) {
        tendencia = "📉";
        colorTendencia = "var(--danger)";
      }

      return {
        jugador,
        puntosActuales: statsActuales.puntos,
        prediccionPuntos,
        deudaActual: statsActuales.pago,
        prediccionPago,
        tendencia,
        colorTendencia,
        posicionActual: posActualMap[jugador] || 0,
        posicionFinal: 0,
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

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  return (
    <div className="pred-panel">
      <div className="panel panel-screen">
        <h2 className="h2">🔮 El Oráculo</h2>
        <p className="subtitle">
          Simulación de la J38 basada en historial y tendencias
        </p>

        <div className="pred-stats">
          <div className="pred-stat">
            <div className="pred-stat-label">Jugadas</div>
            <div className="pred-stat-value pred-stat-value--green">
              {jornadasJugadas}
            </div>
          </div>
          <div className="pred-stat-divider" />
          <div className="pred-stat">
            <div className="pred-stat-label">Restantes</div>
            <div className="pred-stat-value pred-stat-value--red">
              {jornadasRestantes}
            </div>
          </div>
        </div>

        <div className="pred-header">
          <div className="col-pos">Pos</div>
          <div className="col-jugador">Jugador</div>
          <div className="col-pts">Puntos J38</div>
          <div className="col-pago">Deuda J38</div>
        </div>

        <div className="pred-list">
          {ranking?.map((j, idx) => {
            const difPos = j.posicionActual - j.posicionFinal;

            const difClass =
              difPos > 0
                ? "diff diff--up"
                : difPos < 0
                  ? "diff diff--down"
                  : "diff diff--neutral";
            const difText =
              difPos > 0 ? `+${difPos} ▲` : difPos < 0 ? `${difPos} ▼` : `=`;

            return (
              <div
                key={j.jugador}
                className={`pred-row ${idx === 0 ? "pred-row--top" : ""}`}
                style={{ ["--row-bg" as any]: undefined }}
              >
                <div className="pred-pos">
                  <span className="pred-pos-number">{j.posicionFinal}</span>
                  <div className="pred-diff">
                    <span className={difClass}>{difText}</span>
                  </div>
                </div>

                <div className="pred-player">
                  <span className="pred-name">{j.jugador}</span>
                  <span
                    className="pred-trend"
                    style={{ color: j.colorTendencia }}
                  >
                    {j.tendencia} Tendencia
                  </span>
                </div>

                <div className="pred-pts">
                  <span className="amount" style={{ color: "var(--success)" }}>
                    {j.prediccionPuntos}
                  </span>
                  <span className="muted-small">Act: {j.puntosActuales}</span>
                </div>

                <div className="pred-amount">
                  <span
                    className={`amount ${j.prediccionPago > 0 ? "amount--owed" : "amount--free"}`}
                    style={{
                      color: j.prediccionPago > 0 ? undefined : undefined,
                    }}
                  >
                    {formatEuros(j.prediccionPago)}€
                  </span>
                  <span className="muted-small">
                    Act: {formatEuros(j.deudaActual)}€
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
