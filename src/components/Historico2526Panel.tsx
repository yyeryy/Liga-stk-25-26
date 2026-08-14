import React, { useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import "./HistoricoPanel.css";

export const Historico2526Panel = () => {
  const [temporadaSeleccionada] = useState("25/26");

  const estadisticas = useMemo(() => {
    // Desertores en 25/26
    const desertersNames = ["Zarrakatz", "Polfovich"];

    // solicitar esEstadistica=true para incluir players que luego mostraremos como desertores
    const resultado = calcularAcumulado(1, 38, true);
    const rankingGeneral = [...resultado].sort(
      (a, b) => a.pago - b.pago || b.puntos - a.puntos,
    );

    const desertersLocal = rankingGeneral.filter((j: any) =>
      desertersNames.includes(j.jugador),
    );
    const mainRankingLocal = rankingGeneral.filter(
      (j: any) => !desertersNames.includes(j.jugador),
    );

    // Recalcular orden y posiciones de la clasificación principal (sin desertores)
    const mainRankingSorted = [...mainRankingLocal].sort(
      (a: any, b: any) => a.pago - b.pago || b.puntos - a.puntos,
    );
    mainRankingSorted.forEach((j: any, idx: number) => (j.posicion = idx + 1));

    const maxPago = mainRankingSorted.length
      ? Math.max(...mainRankingSorted.map((j: any) => j.pago))
      : 0;
    const mecenas = mainRankingSorted.find((j: any) => j.pago === maxPago);
    const totalBote = mainRankingLocal.reduce(
      (acc: number, curr: any) => acc + curr.pago,
      0,
    );

    return {
      ranking: rankingGeneral,
      mainRanking: mainRankingSorted,
      deserters: desertersLocal,
      campeon: mainRankingSorted[0],
      mecenas: mecenas,
      maxPago: maxPago,
      totalBote: totalBote,
    };
  }, []);

  const getColorByPago = (pago: number, maxPago: number) => {
    if (maxPago === 0 || pago === 0) return "var(--success-100)";
    const ratio = Math.min(1, pago / maxPago);
    const start = { r: 255, g: 245, b: 245 };
    const end = { r: 255, g: 205, b: 210 };
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    return `rgb(${r},${g},${b})`;
  };

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  const { mainRanking, deserters, campeon, mecenas, maxPago, totalBote } =
    estadisticas as any;

  // Override specific owed amounts requested by user
  const overrideAmounts: Record<string, number> = {
    Zarrakatz: 14.0,
    Polfovich: 19.0,
  };

  return (
    <div className="historico-panel">
      <div className="panel historico-content panel-screen">
        <h2 className="h2">🏛️ Salón de la Fama</h2>
        <p className="text-muted historico-subtitle">
          Clasificación general y récords de la Temporada{" "}
          {temporadaSeleccionada}
        </p>

        <Row className="g-3 mb-4">
          <Col xs={6}>
            <div className="honor-card honor-card--campeon">
              <div className="honor-icon">🛡️</div>
              <div className="honor-label">Rey del Ahorro</div>
              <div className="honor-name">{campeon?.jugador}</div>
              <div className="honor-sub">
                {formatEuros(campeon?.pago || 0)}€ ({campeon?.puntos} pts)
              </div>
            </div>
          </Col>

          <Col xs={6}>
            <div className="honor-card honor-card--mecenas">
              <div className="honor-icon">💸</div>
              <div className="honor-label">El Mecenas</div>
              <div className="honor-name" style={{ color: "var(--gold)" }}>
                {mecenas?.jugador}
              </div>
              <div className="honor-sub">
                Donó {formatEuros(mecenas?.pago || 0)}€
              </div>
            </div>
          </Col>
        </Row>

        <div className="historico-summary">
          <div className="summary-item">
            <div className="small">Bote Total</div>
            <div className="large" style={{ color: "var(--success)" }}>
              {formatEuros(totalBote)}€
            </div>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <div className="small">Participantes</div>
            <div className="large" style={{ color: "var(--accent)" }}>
              {mainRanking.length}
            </div>
          </div>
        </div>

        <div className="historico-table-header">
          <div className="col-pos">Pos</div>
          <div className="col-player">Jugador</div>
          <div className="col-pts">Pts</div>
          <div className="col-total">Total €</div>
        </div>

        <div className="historico-list">
          {mainRanking.map((j: any) => {
            const isFree = j.pago === 0;
            const rowColor = getColorByPago(j.pago, maxPago);

            return (
              <div
                key={j.jugador}
                className={`historico-row ${isFree ? "historico-row--free" : ""}`}
                style={{ ["--row-bg" as any]: rowColor }}
              >
                <div className="historico-pos">
                  {j.posicion === 1 ? (
                    "🥇"
                  ) : j.posicion === 2 ? (
                    "🥈"
                  ) : j.posicion === 3 ? (
                    "🥉"
                  ) : (
                    <span className="medal-text">{j.posicion}º</span>
                  )}
                </div>

                <div
                  className={`historico-player`}
                  style={{
                    fontWeight: j.posicion <= 3 ? 800 : 600,
                  }}
                >
                  <span>{j.jugador}</span>
                </div>

                <div
                  className={`historico-pts ${j.posicion === 1 ? "pts-top" : "pts-default"}`}
                >
                  {j.puntos}
                </div>

                <div className="historico-amount">
                  <span
                    className={`amount ${isFree ? "amount--free" : "amount--owed"}`}
                  >
                    {formatEuros(j.pago)}€
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {deserters.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h5 style={{ marginBottom: 8 }}>
              <span>⚠️</span> Desertores Pendientes
            </h5>
            <div className="historico-list">
              {deserters.map((d: any) => (
                <div
                  key={d.jugador}
                  className={`historico-row historico-row--deserter`}
                  style={{ ["--row-bg" as any]: "var(--surface-variant)" }}
                >
                  <div className="historico-pos">🏳️</div>
                  <div className={`historico-player player--deserter`}>
                    <span>{d.jugador}</span>
                    <span style={{ fontSize: "0.8rem", marginLeft: 8 }}>
                      🏃💨
                    </span>
                  </div>
                  <div className="historico-pts">—</div>
                  <div className="historico-amount">
                    <span className={`amount amount--deserter`}>
                      {formatEuros(overrideAmounts[d.jugador] ?? d.pago)}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico2526Panel;
