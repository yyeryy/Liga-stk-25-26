import React, { useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { historico24_25 } from "../data/historico24_25.ts";
import "./HistoricoPanel.css";

export const HistoricoPanel = () => {
  const [temporadaSeleccionada] = useState("24/25");

  // Procesamos los datos históricos
  const estadisticas = useMemo(() => {
    const rankingGeneral = [...historico24_25].sort(
      (a, b) => a.pago - b.pago || b.puntos - a.puntos,
    );

    rankingGeneral.forEach((j, idx) => {
      (j as any).posicion = idx + 1;
    });

    const maxPago = Math.max(...rankingGeneral.map((j) => j.pago));
    const mecenas = rankingGeneral.find((j) => j.pago === maxPago);
    const totalBote = rankingGeneral.reduce((acc, curr) => acc + curr.pago, 0);

    return {
      ranking: rankingGeneral,
      campeon: rankingGeneral[0],
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

  const { ranking, campeon, mecenas, maxPago, totalBote } = estadisticas;

  return (
    <div className="historico-panel">
      <div className="panel historico-content panel-screen">
        <h2 className="h2">🏛️ Salón de la Fama</h2>
        <p className="text-muted historico-subtitle">
          Clasificación general y récords de la Temporada{" "}
          {temporadaSeleccionada}
        </p>

        {/* --- Cuadro de Honor --- */}
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

        {/* Resumen de la temporada */}
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
              {ranking.length}
            </div>
          </div>
        </div>

        {/* Cabecera de la Tabla */}
        <div className="historico-table-header">
          <div className="col-pos">Pos</div>
          <div className="col-player">Jugador</div>
          <div className="col-pts">Pts</div>
          <div className="col-total">Total €</div>
        </div>

        {/* Lista Histórica */}
        <div className="historico-list">
          {ranking.map((j: any) => {
            const isDeserter = j.jugador === "Manchester Piti";
            const isFree = j.pago === 0 && !isDeserter;
            const rowColor = isDeserter
              ? "var(--surface-variant)"
              : getColorByPago(j.pago, maxPago);

            return (
              <div
                key={j.jugador}
                className={`historico-row ${isDeserter ? "historico-row--deserter" : ""} ${isFree ? "historico-row--free" : ""}`}
                style={{ ["--row-bg" as any]: rowColor }}
              >
                <div className="historico-pos">
                  {isDeserter ? (
                    "🏳️"
                  ) : j.posicion === 1 ? (
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
                  className={`historico-player ${isDeserter ? "player--deserter" : ""}`}
                  style={{
                    fontWeight: j.posicion <= 3 && !isDeserter ? 800 : 600,
                  }}
                >
                  <span>{j.jugador}</span>
                  {isDeserter && (
                    <span style={{ fontSize: "0.8rem", marginLeft: "4px" }}>
                      🏃💨
                    </span>
                  )}
                </div>

                <div
                  className={`historico-pts ${j.posicion === 1 && !isDeserter ? "pts-top" : "pts-default"}`}
                >
                  {j.puntos}
                </div>

                <div className="historico-amount">
                  <span
                    className={`amount ${isFree ? "amount--free" : isDeserter ? "amount--deserter" : "amount--owed"}`}
                  >
                    {formatEuros(j.pago)}€
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota del Desertor */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--muted-2)",
            borderTop: "1px dashed #eee",
          }}
        >
          <span style={{ fontWeight: "bold", color: "var(--danger)" }}>
            * Nota histórica:
          </span>{" "}
          Manchester Piti abandonó la competición a mitad de temporada.
        </div>
      </div>
    </div>
  );
};
