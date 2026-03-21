import { useMemo, useState } from "react";
import { data } from "../data/data.ts";
import { Apodos } from "../models/models.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const PALETA_COLORES = [
  "#3498db",
  "#e74c3c",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#34495e",
  "#1abc9c",
  "#e67e22",
  "#d35400",
  "#c0392b",
  "#8e44ad",
];
const jugadoresDisponibles = Object.values(Apodos);

export const EvolucionPanel = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Apodos[]>(
    jugadoresDisponibles.slice(0, 3),
  );

  // NUEVO: Estado para alternar entre gráficas
  const [modo, setModo] = useState<"puntos" | "pagos">("puntos");

  const chartData = useMemo(() => {
    // Averiguamos cuántas jornadas se han jugado realmente
    const jornadasJugadas = data.jornadas.filter((j) =>
      j.resultados.some((r) => r.puntos > 0),
    ).length;

    const historial: any[] = [];
    const acumulados: Record<string, { puntos: number; pago: number }> = {};

    jugadoresDisponibles.forEach(
      (p) => (acumulados[p] = { puntos: 0, pago: 0 }),
    );

    // Calculamos jornada a jornada para sumar los pagos y puntos de forma acumulativa
    for (let i = 1; i <= jornadasJugadas; i++) {
      const statsJornada = calcularAcumulado(i, i);
      const dataPoint: any = { name: `J${i}` };

      jugadoresDisponibles.forEach((p) => {
        const stats = statsJornada.find((r) => r.jugador === p);

        if (stats) {
          acumulados[p].puntos += stats.puntos;
          acumulados[p].pago += stats.pago;
        }

        // Aplicamos las penalizaciones manuales en el momento temporal correcto para que la gráfica sea fiel
        if (i === 5 && p === Apodos.Pitxu15pesos) acumulados[p].pago += 12;
        if (i === 10 && p === Apodos.ElManito) acumulados[p].pago += 5;

        dataPoint[`${p}_puntos`] = acumulados[p].puntos;
        dataPoint[`${p}_pagos`] = Math.round(acumulados[p].pago * 100) / 100;
      });

      historial.push(dataPoint);
    }
    return historial;
  }, []);

  const handleTogglePlayer = (player: Apodos) => {
    setSelectedPlayers((prev) =>
      prev.includes(player)
        ? prev.filter((p) => p !== player)
        : [...prev, player],
    );
  };

  const getPlayerColor = (player: Apodos) => {
    const idx = jugadoresDisponibles.indexOf(player);
    return PALETA_COLORES[idx % PALETA_COLORES.length];
  };

  if (chartData.length === 0) {
    return (
      <div className="p-4 text-center">Aún no hay jornadas disputadas.</div>
    );
  }

  return (
    <div
      style={{
        padding: "10px",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
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
            marginBottom: "15px",
            fontSize: "1.5rem",
          }}
        >
          📈 Evolución de la Liga
        </h2>

        {/* CONTROLES: Modo de Gráfica */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              border: "1px solid #eee",
              padding: "4px",
            }}
          >
            <button
              onClick={() => setModo("puntos")}
              style={{
                flex: 1,
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                transition: "all 0.2s",
                backgroundColor: modo === "puntos" ? "#3498db" : "transparent",
                color: modo === "puntos" ? "white" : "#7f8c8d",
              }}
            >
              🏅 Puntos
            </button>
            <button
              onClick={() => setModo("pagos")}
              style={{
                flex: 1,
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                transition: "all 0.2s",
                backgroundColor: modo === "pagos" ? "#e74c3c" : "transparent",
                color: modo === "pagos" ? "white" : "#7f8c8d",
              }}
            >
              💸 Deudas
            </button>
          </div>
        </div>

        {/* CONTROLES: Selectores tipo "Chip" (Perfectos para móvil) */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {jugadoresDisponibles.map((player) => {
              const isSelected = selectedPlayers.includes(player);
              const color = getPlayerColor(player);
              return (
                <div
                  key={player}
                  onClick={() => handleTogglePlayer(player)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: `1px solid ${isSelected ? color : "#dee2e6"}`,
                    backgroundColor: isSelected ? `${color}15` : "#fff",
                    color: isSelected ? color : "#6c757d",
                    fontWeight: isSelected ? "bold" : "normal",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: isSelected ? color : "#dee2e6",
                    }}
                  ></div>
                  {player}
                </div>
              );
            })}
          </div>
        </div>

        {/* ÁREA DE LA GRÁFICA */}
        {selectedPlayers.length === 0 ? (
          <div
            className="d-flex align-items-center justify-content-center bg-light rounded text-muted p-5 border"
            style={{ minHeight: "300px", textAlign: "center" }}
          >
            <p className="mb-0">
              ⚠️ Toca algún jugador arriba para comenzar la comparativa.
            </p>
          </div>
        ) : (
          /* Contenedor que permite Scroll Horizontal en móvil */
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: "10px",
            }}
          >
            <div style={{ minWidth: "700px", height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#adb5bd", fontSize: 12, fontWeight: "bold" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#adb5bd", fontSize: 12 }}
                    domain={["auto", "auto"]} // Ajusta la escala automáticamente
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      border: "1px solid #eee",
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                    labelStyle={{
                      fontWeight: "900",
                      color: "#2c3e50",
                      marginBottom: "8px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "4px",
                    }}
                    formatter={(value: any) => [
                      modo === "puntos" ? `${value} pts` : `${value}€`,
                      "",
                    ]}
                  />

                  {/* Líneas Dinámicas */}
                  {selectedPlayers.map((player) => (
                    <Line
                      key={player}
                      type="monotone"
                      dataKey={`${player}_${modo}`} // Alterna la fuente de datos según el botón pulsado
                      name={player}
                      stroke={getPlayerColor(player)}
                      strokeWidth={3}
                      dot={
                        chartData.length > 15
                          ? false
                          : { strokeWidth: 2, r: 4, fill: "#fff" }
                      } // Oculta los puntos si hay muchas jornadas
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      animationDuration={400}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
