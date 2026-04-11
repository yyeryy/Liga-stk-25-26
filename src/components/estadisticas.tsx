import { useState, useEffect } from "react";
import "./estadisticas.css";
import type { CSSProperties } from "react";
import { Apodos } from "../models/models.ts";
import Badge from "react-bootstrap/Badge";
import {
  obtenerMaximos,
  obtenerMinimos,
  obtenerPromedios,
  vecesTop1,
  vecesTop3,
  jornadasLibradas,
} from "../utils/calcularAcumulado.ts";

export const EstadisticasPanel = () => {
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

  if (!stats)
    return (
      <p className="text-muted centered-loading">Cargando estadísticas...</p>
    );

  // Filtramos a los desertores para que no adulteren las estadísticas (medias, mínimos, etc.)
  const jugadoresActivos = Object.values(Apodos).filter(
    (j) => j !== Apodos.Zarrakatz && j !== Apodos.Polfovich,
  );

  const miniTables = [
    {
      title: "🌟 Máxima puntuación",
      data: stats.max,
      order: "desc",
      unit: "pts",
      color: "success",
    },
    {
      title: "📉 Mínima puntuación",
      data: stats.min,
      order: "asc",
      unit: "pts",
      color: "danger",
    },
    {
      title: "⚖️ Puntuación media",
      data: stats.avg,
      order: "desc",
      unit: "pts/j",
      color: "primary",
    },
    {
      title: "🥇 Veces Top 1",
      data: stats.top1,
      order: "desc",
      unit: "veces",
      color: "warning",
    },
    {
      title: "🔥 Veces en el Podio",
      data: stats.top3,
      order: "desc",
      unit: "veces",
      color: "info",
    },
    {
      title: "🏖️ Jornadas libradas",
      data: stats.libradas,
      order: "desc",
      unit: "veces",
      color: "secondary",
    },
  ];

  const getPodiumStyles = (idx: number) => {
    switch (idx) {
      case 0:
        return {
          bg: "var(--neutral-100)",
          border: "1px solid var(--warning-300)",
          color: "var(--gold)",
          medal: "🥇",
          fw: "800",
        };
      case 1:
        return {
          bg: "var(--surface-variant)",
          border: "1px solid var(--surface-border)",
          color: "var(--neutral-600)",
          medal: "🥈",
          fw: "700",
        };
      case 2:
        return {
          bg: "var(--surface-variant)",
          border: "1px solid var(--orange-dark)",
          color: "var(--orange-dark)",
          medal: "🥉",
          fw: "700",
        };
      default:
        return {
          bg: "transparent",
          border: "1px solid transparent",
          color: "var(--text)",
          medal: idx + 1,
          fw: "600",
        };
    }
  };

  return (
    <div className="estadisticas-panel">
      <div className="panel panel-screen">
        <h2 className="h2">📊 Panel de Estadísticas</h2>

        <div className="mini-grid">
          {miniTables.map((stat) => {
            const jugadoresOrdenados = [...jugadoresActivos].sort((a, b) =>
              stat.order === "asc"
                ? (stat.data[a] || 0) - (stat.data[b] || 0)
                : (stat.data[b] || 0) - (stat.data[a] || 0),
            );

            return (
              <div key={stat.title} className="mini-table">
                <div className="mini-table-header">
                  <h3 className="mini-table-title">{stat.title}</h3>
                </div>

                <div className="mini-table-body">
                  {jugadoresOrdenados.map((j, idx) => {
                    const podium = getPodiumStyles(idx);

                    // Formateo de los valores
                    const valor = stat.title.toLowerCase().includes("media")
                      ? new Intl.NumberFormat("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(stat.data[j] || 0)
                      : (stat.data[j] || 0).toFixed(0);

                    return (
                      <div
                        key={j}
                        title={`Ver expediente de ${j}`}
                        className="stat-row"
                        style={
                          {
                            ["--row-bg" as any]: podium.bg,
                            ["--row-border" as any]: podium.border,
                            ["--row-color" as any]: podium.color,
                            ["--row-fw" as any]: podium.fw,
                          } as CSSProperties
                        }
                      >
                        <div className="stat-left">
                          <span className="podium-medal">
                            {typeof podium.medal === "number" ? (
                              <span className="podium-number">
                                {podium.medal}
                              </span>
                            ) : (
                              podium.medal
                            )}
                          </span>
                          <span className="stat-player">{j}</span>
                        </div>

                        <Badge
                          bg={stat.color}
                          text={stat.color === "warning" ? "dark" : "light"}
                          pill
                          className="stat-badge"
                        >
                          {valor}{" "}
                          <span className="badge-unit">{stat.unit}</span>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
