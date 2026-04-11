import { useState, useEffect, useMemo } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";
import "./pagos.css";

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
    if (maxPago === 0 || pago === 0) return "var(--success-100)";
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
    return <span className="medal-text">{pos}º</span>;
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

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  return (
    <div className="pagos-panel">
      <div className="panel panel-screen">
        <h2 className="h2">💸 Panel de Pagos</h2>
        <p className="subtitle">Consulta las deudas por tramos de liga</p>

        <div className="selectWrapper">
          <select
            value={selectedBloque}
            onChange={(e) => setSelectedBloque(Number(e.target.value))}
            className="select-primary"
          >
            {bloques.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="pagos-header">
          <div className="pagos-col-pos">Pos</div>
          <div className="pagos-col-player">Jugador</div>
          <div className="pagos-col-puntos">Pts</div>
          <div className="pagos-col-pago">Deuda</div>
        </div>

        <div className="pagos-list">
          {pagos.map((j, idx) => {
            const isFree = (j.pago ?? 0) === 0;
            const rowColor = getColorByPago(j.pago ?? 0, maxPagoActual);

            return (
              <div
                key={idx}
                className="pagos-row"
                style={{
                  ["--row-bg" as any]: rowColor,
                  ["--row-amount" as any]: isFree
                    ? "var(--success)"
                    : "var(--danger)",
                }}
              >
                <div className="pagos-col-pos">{getMedal(j.posicion ?? 0)}</div>

                <div className="pagos-col-player">{j.jugador}</div>

                <div className="pagos-col-puntos">{j.puntos}</div>

                <div className="pagos-col-pago">
                  <span className="amount">{formatEuros(j.pago ?? 0)}€</span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedBloque === 0 && (
          <div className="alert-card">
            <div className="alert-title">
              {" "}
              <span>⚠️</span> Desertores Pendientes
            </div>
            <div className="alert-row">
              <span>Zarrakatz</span>
              <span>14.00€</span>
            </div>
            <div className="alert-row alert-row--mt">
              <span>Polfovich</span>
              <span>19.00€</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
