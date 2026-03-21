import { useState, useEffect, useMemo } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";
import { Apodos } from "../models/models.ts";

export const PagosPanel = () => {
  const [selectedBloque, setSelectedBloque] = useState(0);
  const [pagos, setPagos] = useState<JugadorPago[]>([]);

  const bloques = useMemo(
    () => [
      { id: 0, nombre: "General (Total)", desde: 1, hasta: 38 },
      { id: 1, nombre: "Jornadas 1-5", desde: 1, hasta: 5 },
      { id: 2, nombre: "Jornadas 6-10", desde: 6, hasta: 10 },
      { id: 3, nombre: "Jornadas 11-15", desde: 11, hasta: 15 },
      { id: 4, nombre: "Jornadas 16-20", desde: 16, hasta: 20 },
      { id: 5, nombre: "Jornadas 21-25", desde: 21, hasta: 25 },
      { id: 6, nombre: "Jornadas 26-30", desde: 26, hasta: 30 },
      { id: 7, nombre: "Jornadas 31-35", desde: 31, hasta: 35 },
      { id: 8, nombre: "Jornadas 36-38", desde: 36, hasta: 38 },
    ],
    [],
  );

  // RECUPERAMOS TU FUNCIÓN DE GRADIENTE
  const getColorByPago = (pago: number, maxPago: number) => {
    if (maxPago === 0 || pago === 0) return "#e8f5e9";
    const ratio = Math.min(1, pago / maxPago);
    const start = { r: 232, g: 245, b: 233 };
    const end = { r: 255, g: 205, b: 210 };
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

  useEffect(() => {
    const bloque = bloques.find((b) => b.id === selectedBloque);
    if (!bloque) return;
    const resultado = calcularAcumulado(bloque.desde, bloque.hasta);
    const resultadoOrdenado = [...resultado].sort((a, b) => a.pago - b.pago);

    let lastPago: number | null = null;
    let lastPos = 0;
    resultadoOrdenado.forEach((j, idx) => {
      if (j.pago === lastPago) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPago = j.pago;
        j.posicion = lastPos;
      }
    });
    setPagos(resultadoOrdenado);
  }, [selectedBloque, bloques]);

  const maxPagoActual = Math.max(...pagos.map((p) => p.pago), 0);

  const colWidths = {
    pos: "15%",
    jugador: "40%",
    puntos: "20%",
    pago: "25%",
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
          💸 Panel de Pagos
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "0.85rem",
            marginBottom: "20px",
          }}
        >
          Consulta las deudas por tramos de liga
        </p>

        <div style={{ marginBottom: "25px" }}>
          <select
            value={selectedBloque}
            onChange={(e) => setSelectedBloque(Number(e.target.value))}
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
            {bloques.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>

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
          <div style={{ width: colWidths.pos, textAlign: "center" }}>Pos</div>
          <div style={{ width: colWidths.jugador }}>Jugador</div>
          <div style={{ width: colWidths.puntos, textAlign: "center" }}>
            Pts
          </div>
          <div style={{ width: colWidths.pago, textAlign: "right" }}>Deuda</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {pagos.map((j, idx) => {
            const isFree = (j.pago ?? 0) === 0;
            // APLICAMOS TU GRADIENTE AQUÍ
            const rowColor = getColorByPago(j.pago ?? 0, maxPagoActual);

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: rowColor,
                  border: "1px solid rgba(0,0,0,0.05)", // Borde muy sutil para que mande el gradiente
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
                    fontWeight: "600",
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
                    color: "#7f8c8d",
                    fontSize: "0.9rem",
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
                      color: isFree ? "#27ae60" : "#c0392b", // Rojo un poco más oscuro para que lea bien sobre el fondo rojizo
                    }}
                  >
                    {formatEuros(j.pago ?? 0)}€
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedBloque === 0 && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              backgroundColor: "#fff5f5",
              borderRadius: "12px",
              border: "1px dashed #ffcccc",
            }}
          >
            <div
              style={{
                fontWeight: "900",
                color: "#c0392b",
                marginBottom: "8px",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>⚠️</span> Desertores Pendientes
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#e74c3c",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              <span>Zarrakatz</span>
              <span>14.00€</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#e74c3c",
                fontWeight: "bold",
                fontSize: "0.9rem",
                marginTop: "4px",
              }}
            >
              <span>Polfovich</span>
              <span>19.00€</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
