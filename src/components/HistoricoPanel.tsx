import React, { useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { historico24_25 } from "../data/historico24_25.ts";

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
    if (maxPago === 0 || pago === 0) return "#f1fcf5";
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
          🏛️ Salón de la Fama
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "0.85rem",
            marginBottom: "25px",
          }}
        >
          Clasificación general y récords de la Temporada{" "}
          {temporadaSeleccionada}
        </p>

        {/* --- Cuadro de Honor --- */}
        <Row className="g-3 mb-4">
          <Col xs={6}>
            <div
              style={{
                background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                borderRadius: "15px",
                padding: "15px",
                color: "white",
                boxShadow: "0 8px 20px rgba(253, 160, 133, 0.3)",
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>🛡️</div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  fontWeight: "900",
                  letterSpacing: "1px",
                  marginTop: "5px",
                  opacity: 0.9,
                }}
              >
                Rey del Ahorro
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "black",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                  marginTop: "2px",
                }}
              >
                {campeon?.jugador}
              </div>
              <div
                style={{ fontSize: "0.9rem", fontWeight: "bold", opacity: 0.9 }}
              >
                {formatEuros(campeon?.pago || 0)}€ ({campeon?.puntos} pts)
              </div>
            </div>
          </Col>

          <Col xs={6}>
            <div
              style={{
                background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                borderRadius: "15px",
                padding: "15px",
                color: "white",
                boxShadow: "0 8px 20px rgba(44, 62, 80, 0.3)",
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>💸</div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  fontWeight: "900",
                  letterSpacing: "1px",
                  marginTop: "5px",
                  opacity: 0.9,
                }}
              >
                El Mecenas
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "black",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                  marginTop: "2px",
                  color: "#f1c40f",
                }}
              >
                {mecenas?.jugador}
              </div>
              <div
                style={{ fontSize: "0.9rem", fontWeight: "bold", opacity: 0.9 }}
              >
                Donó {formatEuros(mecenas?.pago || 0)}€
              </div>
            </div>
          </Col>
        </Row>

        {/* Resumen de la temporada */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f8f9fa",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: "1px solid #eee",
          }}
        >
          <div style={{ textAlign: "center", width: "45%" }}>
            <div
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                color: "#7f8c8d",
                fontWeight: "bold",
              }}
            >
              Bote Total
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "black",
                color: "#27ae60",
              }}
            >
              {formatEuros(totalBote)}€
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#dee2e6" }}></div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                color: "#7f8c8d",
                fontWeight: "bold",
              }}
            >
              Participantes
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "black",
                color: "#3498db",
              }}
            >
              {ranking.length}
            </div>
          </div>
        </div>

        {/* Cabecera de la Tabla */}
        <div
          style={{
            display: "flex",
            padding: "0 5px 10px 5px",
            color: "#a5b1c2",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            fontWeight: "bold",
            borderBottom: "2px solid #f0f0f0",
            marginBottom: "10px",
          }}
        >
          <div style={{ width: "15%", textAlign: "center" }}>Pos</div>
          <div style={{ width: "40%" }}>Jugador</div>
          <div style={{ width: "20%", textAlign: "center" }}>Pts</div>
          <div style={{ width: "25%", textAlign: "right" }}>Total €</div>
        </div>

        {/* Lista Histórica */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {ranking.map((j: any) => {
            const isDeserter = j.jugador === "Manchester Piti";
            const isFree = j.pago === 0 && !isDeserter;
            const rowColor = isDeserter
              ? "#f8f9fa"
              : getColorByPago(j.pago, maxPago);

            return (
              <div
                key={j.jugador}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: rowColor,
                  border: isFree
                    ? "1px solid #c3e6cb"
                    : "1px solid rgba(0,0,0,0.05)",
                  borderRadius: "10px",
                  padding: "12px 10px",
                  opacity: isDeserter ? 0.5 : 1, // Opacidad baja para el desertor
                  filter: isDeserter ? "grayscale(100%)" : "none", // En blanco y negro
                }}
              >
                <div
                  style={{
                    width: "15%",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  {isDeserter ? (
                    "🏳️"
                  ) : j.posicion === 1 ? (
                    "🥇"
                  ) : j.posicion === 2 ? (
                    "🥈"
                  ) : j.posicion === 3 ? (
                    "🥉"
                  ) : (
                    <span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
                      {j.posicion}º
                    </span>
                  )}
                </div>

                <div
                  style={{
                    width: "40%",
                    fontWeight: j.posicion <= 3 && !isDeserter ? "800" : "600",
                    color: "#2c3e50",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span
                    style={{
                      textDecoration: isDeserter ? "line-through" : "none",
                    }}
                  >
                    {j.jugador}
                  </span>
                  {isDeserter && (
                    <span style={{ fontSize: "0.8rem", marginLeft: "4px" }}>
                      🏃💨
                    </span>
                  )}
                </div>

                <div
                  style={{
                    width: "20%",
                    textAlign: "center",
                    fontWeight: "bold",
                    color:
                      j.posicion === 1 && !isDeserter ? "#d35400" : "#7f8c8d",
                    fontSize: "1rem",
                  }}
                >
                  {j.puntos}
                </div>

                <div
                  style={{
                    width: "25%",
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "900",
                      fontSize: "1.1rem",
                      color: isFree
                        ? "#27ae60"
                        : isDeserter
                          ? "#7f8c8d"
                          : "#c0392b",
                    }}
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
            color: "#95a5a6",
            borderTop: "1px dashed #eee",
          }}
        >
          <span style={{ fontWeight: "bold", color: "#e74c3c" }}>
            * Nota histórica:
          </span>{" "}
          Manchester Piti abandonó la competición a mitad de temporada.
        </div>
      </div>
    </div>
  );
};
