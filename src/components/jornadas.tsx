import { useState, useEffect } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";
import "./jornadas.css";
import CustomSelect from "./CustomSelect.tsx";

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState<number>(1);
  const [jornada, setJornada] = useState<JugadorPago[]>([]);

  useEffect(() => {
    setJornada(calcularAcumulado(selectedJornada, selectedJornada));
  }, [selectedJornada]);

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
    return <span className="medal-text">{pos}º</span>;
  };

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  const maxPagoJornada = Math.max(...jornada.map((p) => p.pago ?? 0), 0);
  const jornadaNoDisputada =
    jornada.length === 0 || jornada.every((j) => j.puntos === 0);

  return (
    <div className="jornadas-panel">
      <div className="panel panel-screen">
        <h2 className="h2">🗓️ Jornadas</h2>
        <p className="subtitle">Consulta los puntos y pagos por jornada</p>

        <div className="selectWrapper">
          <CustomSelect
            id="jornada-select"
            value={String(selectedJornada)}
            onChange={(v) => setSelectedJornada(Number(v))}
            options={Array.from({ length: 38 }, (_, i) => i + 1).map((j) => ({
              value: String(j),
              label: `Jornada ${j}`,
            }))}
            className="select-primary"
            placeholder="Selecciona jornada"
          />
        </div>

        <div className="tableWrapper">
          {jornadaNoDisputada ? (
            <div className="jornada-empty">
              <span className="jornada-empty__emoji">⏳</span>
              <h5 className="mt-2 text-muted">Jornada sin empezar</h5>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", margin: 0 }}
              >
                Aún no hay puntos registrados.
              </p>
            </div>
          ) : (
            <>
              <div className="jornada-header">
                <div className="col-pos">Pos</div>
                <div className="col-jugador">Jugador</div>
                <div className="col-puntos">Pts</div>
                <div className="col-pago">Pago</div>
              </div>

              <div className="jornada-list">
                {jornada.map((j, idx) => {
                  const isFree = (j.pago ?? 0) === 0;
                  const esPodio = (j.posicion ?? 0) <= 3;
                  const rowColor = getColorByPago(j.pago ?? 0, maxPagoJornada);

                  return (
                    <div
                      key={idx}
                      className={`jornada-row ${isFree ? "jornada-row--free" : ""}`}
                      style={{ ["--row-bg" as any]: rowColor }}
                    >
                      <div className="jornada-pos">
                        {getMedal(j.posicion ?? 0)}
                      </div>

                      <div
                        className={`jornada-player ${esPodio ? "jornada-player--podio" : ""}`}
                      >
                        {j.jugador}
                      </div>

                      <div
                        className={`jornada-pts ${esPodio ? "jornada-pts--podio" : "jornada-pts--default"}`}
                      >
                        {j.puntos}
                      </div>

                      <div className="jornada-amount">
                        <span
                          className={`amount ${isFree ? "amount--free" : "amount--owed"}`}
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
