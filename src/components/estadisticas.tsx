import { useState, useEffect } from "react";
import { Apodos } from "../models/models.ts";
import {
  obtenerMaximos,
  obtenerMinimos,
  obtenerPromedios,
  vecesTop1,
  vecesTop3,
  jornadasLibradas,
} from "../utils/calcularAcumulado.ts";

// NUEVO: Importa tu componente y los datos originales (ajusta las rutas a tu proyecto)
import ModalJugador from "./ModalJugador.tsx";

export const EstadisticasPanel = () => {
  const [stats, setStats] = useState<{
    max: Record<Apodos, number>;
    min: Record<Apodos, number>;
    avg: Record<Apodos, number>;
    top1: Record<Apodos, number>;
    top3: Record<Apodos, number>;
    libradas: Record<Apodos, number>;
  } | null>(null);

  // NUEVO: Estados para controlar el modal
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

  // NUEVO: Función para abrir el modal
  const handleAbrirModal = (jugador: Apodos) => {
    setJugadorSeleccionado(jugador);
    setModalShow(true);
  };

  if (!stats)
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Cargando estadísticas...
      </p>
    );

  const jugadores = Object.values(Apodos);

  const miniTables = [
    { title: "Máxima puntuación", data: stats.max, order: "desc" },
    { title: "Mínima puntuación", data: stats.min, order: "asc" },
    { title: "Puntuación media", data: stats.avg, order: "desc" },
    { title: "Tops 1", data: stats.top1, order: "desc" },
    { title: "Tops 3", data: stats.top3, order: "desc" },
    { title: "Jornadas libre", data: stats.libradas, order: "desc" },
  ];

  const getPodiumStyles = (idx: number) => {
    switch (idx) {
      case 0:
        return {
          backgroundColor: "#fff9c4",
          color: "#b8860b",
          medal: "🥇",
          fontWeight: "bold",
        };
      case 1:
        return {
          backgroundColor: "#f5f5f5",
          color: "#708090",
          medal: "🥈",
          fontWeight: "600",
        };
      case 2:
        return {
          backgroundColor: "#fff3e0",
          color: "#8d6e63",
          medal: "🥉",
          fontWeight: "500",
        };
      default:
        return {
          backgroundColor: "transparent",
          color: "inherit",
          medal: null,
          fontWeight: "normal",
        };
    }
  };

  return (
    <div
      className="estadisticasPanel"
      style={{ padding: "20px", fontFamily: "sans-serif" }}
    >
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>
        📊 Panel de Estadísticas
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "25px",
          justifyContent: "center",
        }}
      >
        {miniTables.map((stat) => {
          const jugadoresOrdenados = [...jugadores].sort((a, b) =>
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
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "16px",
                minWidth: "220px",
                flex: "1 1 250px",
                border: "1px solid #eee",
              }}
            >
              <h3
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  fontSize: "1.1rem",
                  color: "#444",
                  borderBottom: "2px solid #f0f0f0",
                  paddingBottom: "8px",
                }}
              >
                {stat.title}
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem",
                }}
              >
                <tbody>
                  {jugadoresOrdenados.map((j, idx) => {
                    const podium = getPodiumStyles(idx);
                    return (
                      <tr
                        key={j}
                        // NUEVO: Evento onClick y cursor para indicar que es interactivo
                        onClick={() => handleAbrirModal(j as Apodos)}
                        title={`Ver expediente de ${j}`}
                        style={{
                          backgroundColor: podium.backgroundColor,
                          color: podium.color,
                          fontWeight: podium.fontWeight as any,
                          transition: "all 0.2s ease",
                          cursor: "pointer", // Le da estilo de botón al pasar el ratón
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            borderBottom:
                              idx < jugadoresOrdenados.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <span style={{ minWidth: "20px" }}>
                            {podium.medal}
                          </span>
                          {j}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "right",
                            borderBottom:
                              idx < jugadoresOrdenados.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          {stat.title === "Puntuación media"
                            ? new Intl.NumberFormat("es-ES", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(stat.data[j] || 0)
                            : (stat.data[j] || 0).toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* NUEVO: El modal esperando a ser abierto */}
      <ModalJugador
        show={modalShow}
        onHide={() => setModalShow(false)}
        jugador={jugadorSeleccionado}
      />
    </div>
  );
};
