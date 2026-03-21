import { useState, useEffect } from "react";
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

  const [modalShow, setModalShow] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Apodos | null>(
    null,
  );

  useEffect(() => {
    const max = obtenerMaximos();
    const min = obtenerMinimos();
    const avg = obtenerPromedios();
    const top1 = vecesTop1();
    const top3 = vecesTop3();
    const libradas = jornadasLibradas();

    setStats({ max, min, avg, top1, top3, libradas });
  }, []);

  const handleAbrirModal = (jugador: Apodos) => {
    setJugadorSeleccionado(jugador);
    setModalShow(true);
  };

  if (!stats)
    return (
      <p style={{ textAlign: "center", marginTop: "40px", color: "#7f8c8d" }}>
        Cargando estadísticas...
      </p>
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
          bg: "#fffcf0",
          border: "1px solid #fde08b",
          color: "#b8860b",
          medal: "🥇",
          fw: "800",
        };
      case 1:
        return {
          bg: "#f8f9fa",
          border: "1px solid #dee2e6",
          color: "#6c757d",
          medal: "🥈",
          fw: "700",
        };
      case 2:
        return {
          bg: "#fff5f0",
          border: "1px solid #fbdcce",
          color: "#d35400",
          medal: "🥉",
          fw: "700",
        };
      default:
        return {
          bg: "transparent",
          border: "1px solid transparent",
          color: "#2c3e50",
          medal: (
            <span
              style={{
                color: "#bdc3c7",
                fontSize: "0.9rem",
                display: "inline-block",
                width: "16px",
                textAlign: "center",
              }}
            >
              {idx + 1}
            </span>
          ),
          fw: "600",
        };
    }
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
            marginBottom: "25px",
            fontSize: "1.5rem",
          }}
        >
          📊 Panel de Estadísticas
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {miniTables.map((stat) => {
            const jugadoresOrdenados = [...jugadoresActivos].sort((a, b) =>
              stat.order === "asc"
                ? (stat.data[a] || 0) - (stat.data[b] || 0)
                : (stat.data[b] || 0) - (stat.data[a] || 0),
            );

            return (
              <div
                key={stat.title}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  border: "1px solid #eee",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    borderBottom: "2px solid #eee",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      textAlign: "center",
                      fontSize: "1rem",
                      color: "#34495e",
                      fontWeight: "bold",
                    }}
                  >
                    {stat.title}
                  </h3>
                </div>

                <div
                  style={{
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {jugadoresOrdenados.map((j, idx) => {
                    const podium = getPodiumStyles(idx);

                    // Formateo de los valores
                    let valor = stat.title.includes("media")
                      ? new Intl.NumberFormat("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(stat.data[j] || 0)
                      : (stat.data[j] || 0).toFixed(0);

                    return (
                      <div
                        key={j}
                        onClick={() => handleAbrirModal(j as Apodos)}
                        title={`Ver expediente de ${j}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: podium.bg,
                          border: podium.border,
                          borderRadius: "8px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          transition: "transform 0.1s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.02)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{ minWidth: "20px", textAlign: "center" }}
                          >
                            {podium.medal}
                          </span>
                          <span
                            style={{
                              color: podium.color,
                              fontWeight: podium.fw as any,
                              fontSize: "0.95rem",
                            }}
                          >
                            {j}
                          </span>
                        </div>

                        <Badge
                          bg={stat.color}
                          text={stat.color === "warning" ? "dark" : "light"}
                          pill
                          style={{ fontSize: "0.85rem", opacity: 0.9 }}
                        >
                          {valor}{" "}
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: "normal",
                              opacity: 0.8,
                            }}
                          >
                            {stat.unit}
                          </span>
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
