import React, { useState, useEffect } from "react";
import { data } from "../data/data.ts";
import { Apodos } from "../models/models.ts";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";

export const EstadisticasPanel = ({
  desde = 1,
  hasta = 38,
}: {
  desde?: number;
  hasta?: number;
}) => {
  const [stats, setStats] = useState<{
    max: Record<Apodos, number>;
    min: Record<Apodos, number>;
    avg: Record<Apodos, number>;
  } | null>(null);

  useEffect(() => {
    const acumulado = calcularAcumulado(data.jornadas, desde, hasta, true);

    const max: Record<Apodos, number> = {} as Record<Apodos, number>;
    const min: Record<Apodos, number> = {} as Record<Apodos, number>;
    const avg: Record<Apodos, number> = {} as Record<Apodos, number>;

    const totalJornadas = hasta - desde + 1;

    Object.values(Apodos).forEach((j) => {
      max[j] = 0;
      min[j] = Infinity;
      avg[j] = 0;
    });

    acumulado.forEach((j) => {
      max[j.jugador] = j.puntos;
      min[j.jugador] = j.puntos;
      avg[j.jugador] = j.puntos / totalJornadas;
    });

    setStats({ max, min, avg });
  }, [desde, hasta]);

  if (!stats) return <p>Cargando estadísticas...</p>;

  const jugadores = Object.values(Apodos);

  // Calculamos el valor máximo y mínimo general para normalizar colores
  const allValues = [
    ...Object.values(stats.max),
    ...Object.values(stats.min),
    ...Object.values(stats.avg),
  ];
  const globalMax = Math.max(...allValues);
  const globalMin = Math.min(...allValues);

  const getColorByValue = (val: number) => {
    const ratio = (val - globalMin) / (globalMax - globalMin || 1);
    const r = 255;
    const g = Math.round(200 - 100 * ratio); // rojo suave -> más intenso
    const b = Math.round(200 - 100 * ratio);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="estadisticasPanel">
      <h2>
        Estadísticas Jornadas {desde} - {hasta}
      </h2>

      <div
        className="minitablesWrapper"
        style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}
      >
        {[
          { title: "Máxima puntuación", data: stats.max },
          { title: "Mínima puntuación", data: stats.min },
          { title: "Puntuación media", data: stats.avg },
        ].map((stat) => (
          <div
            key={stat.title}
            className="miniCard"
            style={{
              background: "#f9f9f9",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              padding: "12px",
              minWidth: "180px",
              flex: "1 1 200px",
            }}
          >
            <h3 style={{ textAlign: "center", marginBottom: "8px" }}>
              {stat.title}
            </h3>
            <table
              className="miniTable"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
            >
              <tbody>
                {jugadores.map((j) => (
                  <tr key={j}>
                    <td style={{ padding: "4px 8px" }}>{j}</td>
                    <td
                      style={{
                        padding: "4px 8px",
                        backgroundColor: getColorByValue(stat.data[j]),
                      }}
                    >
                      {(stat.data[j] ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
