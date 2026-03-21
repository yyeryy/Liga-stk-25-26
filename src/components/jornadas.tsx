import { useState, useEffect } from "react";
import { Apodos } from "../models/models.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

type JornadaJugador = {
  jugador: Apodos;
  puntos: number;
  pago?: number;
  posicion?: number;
};

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState(1);
  const [jornada, setJornada] = useState<JornadaJugador[]>([]);

  const [modalShow, setModalShow] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Apodos | null>(
    null,
  );

  useEffect(() => {
    setJornada(calcularAcumulado(selectedJornada, selectedJornada));
  }, [selectedJornada]);

  const handleAbrirModal = (jugador: Apodos) => {
    setJugadorSeleccionado(jugador);
    setModalShow(true);
  };

  // Usamos la misma función de gradiente que en el panel de Pagos para mantener consistencia
  const getColorByPago = (pago: number, maxPago: number) => {
    if (maxPago === 0 || pago === 0) return "#f1fcf5"; // Verde súper claro para los salvados
    const ratio = Math.min(1, pago / maxPago);
    const start = { r: 255, g: 245, b: 245 }; // Rojo muy suave
    const end = { r: 255, g: 205, b: 210 }; // Rojo más intenso
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    return `rgb(${r},${g},${b})`;
  };

  const getMedal = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return <span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>{pos}º</span>;
  };

  const colWidths = {
    pos: "15%",
    jugador: "40%",
    puntos: "20%",
    pago: "25%",
  };

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  // Calculamos el pago máximo de la jornada para el gradiente
  const maxPagoJornada = Math.max(...jornada.map((j) => j.pago ?? 0), 0);
  const jornadaNoDisputada = jornada.every((j) => j.puntos === 0);

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
          📅 Resultados por Jornada
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "0.85rem",
            marginBottom: "20px",
          }}
        >
          Selecciona una jornada para ver la clasificación
        </p>

        {/* Selector unificado */}
        <div style={{ marginBottom: "25px" }}>
          <select
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(Number(e.target.value))}
            style={{
              padding: "12px 15px",
              borderRadius: "10px",
              border: "2px solid #3498db",
              width: "100%",
              fontSize: "0.95rem",
              fontWeight: "bold",
              color: "#2980b9",
              backgroundColor: "#f0f8ff",
              outline: "none",
              cursor: "pointer",
              textAlign: "center",
              appearance: "none",
            }}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Jornada {j}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "100%" }}>
          {jornadaNoDisputada ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "1px dashed #dee2e6",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>⏳</span>
              <h5 className="mt-2 text-muted" style={{ color: "#7f8c8d" }}>
                Jornada sin empezar
              </h5>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", margin: 0 }}
              >
                Aún no hay puntos registrados.
              </p>
            </div>
          ) : (
            <>
              {/* Cabecera */}
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
                <div style={{ width: colWidths.pos, textAlign: "center" }}>
                  Pos
                </div>
                <div style={{ width: colWidths.jugador }}>Jugador</div>
                <div style={{ width: colWidths.puntos, textAlign: "center" }}>
                  Pts
                </div>
                <div style={{ width: colWidths.pago, textAlign: "right" }}>
                  Pago
                </div>
              </div>

              {/* Filas Dinámicas */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {jornada.map((j, idx) => {
                  const isFree = (j.pago ?? 0) === 0;
                  const esPodio = (j.posicion ?? 0) <= 3;
                  const rowColor = getColorByPago(j.pago ?? 0, maxPagoJornada);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleAbrirModal(j.jugador)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: rowColor,
                        border: isFree
                          ? "1px solid #c3e6cb"
                          : "1px solid rgba(0,0,0,0.05)",
                        borderRadius: "10px",
                        padding: "12px 10px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-2px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <div
                        style={{
                          width: colWidths.pos,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {getMedal(j.posicion ?? 0)}
                      </div>

                      <div
                        style={{
                          width: colWidths.jugador,
                          fontWeight: esPodio ? "800" : "600",
                          color: "#2c3e50",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {j.jugador}
                      </div>

                      <div
                        style={{
                          width: colWidths.puntos,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: esPodio ? "#3498db" : "#7f8c8d",
                          fontSize: "1rem",
                        }}
                      >
                        {j.puntos}
                      </div>

                      <div
                        style={{
                          width: colWidths.pago,
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
                            color: isFree ? "#27ae60" : "#c0392b",
                          }}
                        >
                          {formatEuros(j.pago ?? 0)}€
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
