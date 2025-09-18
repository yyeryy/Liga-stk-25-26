import React, { useState, useEffect } from "react";
import { Apodos } from "../models/models.ts";
import {
  obtenerMaximos,
  obtenerMinimos,
  obtenerPromedios,
  vecesTop1,
  vecesTop3,
  jornadasLibradas,
} from "../utils/calcularAcumulado.ts";

export const EstadisticasPanel = ({}: {}) => {
  const [stats, setStats] = useState<{
    max: Record<Apodos, number>;
    min: Record<Apodos, number>;
    avg: Record<Apodos, number>;
    top1: Record<Apodos, number>;
    top3: Record<Apodos, number>;
    libradas: Record<Apodos, number>;
  } | null>(null);

  useEffect(() => {
    const max = obtenerMaximos();
    const min = obtenerMinimos();
    const avg = obtenerPromedios();
    const top1 = vecesTop1();
    const top3 = vecesTop3();
    const libradas = jornadasLibradas();

    setStats({ max, min, avg, top1, top3, libradas });
  }, []);

  if (!stats) return <p>Cargando estadísticas...</p>;

  const jugadores = Object.values(Apodos);

  const miniTables = [
    { title: "Máxima puntuación", data: stats.max, order: "desc" },
    { title: "Mínima puntuación", data: stats.min, order: "asc" },
    { title: "Puntuación media", data: stats.avg, order: "desc" },
    { title: "Tops 1", data: stats.top1, order: "desc" },
    { title: "Tops 3", data: stats.top3, order: "desc" },
    { title: "Jornadas libre", data: stats.libradas, order: "desc" },
  ];

  return (
    <div className="estadisticasPanel">
      <h2>Estadísticas</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {miniTables.map((stat) => {
          const jugadoresOrdenados = [...jugadores].sort((a, b) =>
            stat.order === "asc"
              ? stat.data[a] - stat.data[b]
              : stat.data[b] - stat.data[a]
          );

          return (
            <div
              key={stat.title}
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
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center",
                }}
              >
                <tbody>
                  {jugadoresOrdenados.map((j, idx) => (
                    <tr
                      key={j}
                      style={{
                        borderBottom:
                          idx < jugadoresOrdenados.length - 1
                            ? "1px solid #ccc"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "4px 8px", textAlign: "left" }}>
                        {j}
                      </td>
                      <td style={{ padding: "4px 8px" }}>
                        {stat.data[j].toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
