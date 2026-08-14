import React, { useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { historico25_26 } from "../data/historico25_26.ts";
import "./HistoricoPanel.css";

export const Historico2526Panel = () => {
  const [temporadaSeleccionada] = useState("25/26");

  const estadisticas = useMemo(() => {
    // For season 25/26 always use the static historic snapshot to avoid
    // pulling current-season live data.
    const desertersNames = ["Zarrakatz", "Polfovich"];
    const staticRanking = historico25_26.map((h) => ({ ...h }));
    const sortedStatic = staticRanking.sort(
      (a: any, b: any) => a.pago - b.pago || b.puntos - a.puntos,
    );
    sortedStatic.forEach((j: any, idx: number) => (j.posicion = idx + 1));

    const staticDeserters = sortedStatic.filter((j: any) =>
      desertersNames.includes(j.jugador),
    );
    const staticMain = sortedStatic.filter(
      (j: any) => !desertersNames.includes(j.jugador),
    );

    // Recalcular posiciones para la lista principal (sin deserters)
    staticMain.forEach((j: any, idx: number) => (j.posicion = idx + 1));

    const staticMaxPago = sortedStatic.length
      ? Math.max(...sortedStatic.map((j: any) => j.pago))
      : 0;

    return {
      ranking: sortedStatic,
      mainRanking: staticMain,
      deserters: staticDeserters,
      campeon: staticMain[0],
      mecenas: sortedStatic.find((j: any) => j.pago === staticMaxPago),
      maxPago: staticMaxPago,
      totalBote: sortedStatic.reduce(
        (acc: number, curr: any) => acc + curr.pago,
        0,
      ),
      overrideAmounts: {},
    };
  }, []);

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  const {
    mainRanking,
    deserters,
    campeon,
    mecenas,
    maxPago,
    totalBote,
    overrideAmounts,
  } = estadisticas as any;

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

            const medalClass =
              j.posicion === 1
                ? "historico-row--gold"
                : j.posicion === 2
                  ? "historico-row--silver"
                  : j.posicion === 3
                    ? "historico-row--bronze"
                    : j.posicion === 4
                      ? "historico-row--fourth"
                      : "";

            const borderLeftWidth =
              maxPago && j.pago > 0
                ? Math.max(2, Math.round((j.pago / maxPago) * 6))
                : 0;

            return (
              <div
                key={j.jugador}
                className={`historico-row ${isFree ? "historico-row--free" : ""} ${medalClass} ${j.pago > 0 ? "historico-row--owed" : ""}`}
                style={
                  borderLeftWidth
                    ? { borderLeft: `${borderLeftWidth}px solid var(--danger)` }
                    : undefined
                }
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
              <span>⚠️</span> Desertores
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
