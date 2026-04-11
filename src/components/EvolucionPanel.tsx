import { useMemo, useState } from "react";
import "./EvolucionPanel.css";
import type { CSSProperties } from "react";
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
  "#2563eb", // accent
  "#ef4444", // danger
  "#16a34a", // success
  "#f59e0b", // warning
  "#9b59b6", // purple
  "#0f1724", // text
  "#1abc9c", // teal
  "#e67e22", // orange
  "#d35400", // orange-dark
  "#ef4444", // danger
  "#8e44ad", // purple-dark
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
    <div className="evolucion-panel">
      <div className="panel panel-screen">
        <h2 className="h2">📈 Evolución de la Liga</h2>

        {/* CONTROLES: Modo de Gráfica */}
        <div className="toggle-controls">
          <div className="toggle-group">
            <button
              onClick={() => setModo("puntos")}
              className={`toggle-button ${modo === "puntos" ? "active-mode-puntos" : ""}`}
            >
              🏅 Puntos
            </button>
            <button
              onClick={() => setModo("pagos")}
              className={`toggle-button ${modo === "pagos" ? "active-mode-pagos" : ""}`}
            >
              💸 Deudas
            </button>
          </div>
        </div>

        {/* CONTROLES: Selectores tipo "Chip" (Perfectos para móvil) */}
        <div className="chips">
          <div className="chip-container">
            {jugadoresDisponibles.map((player) => {
              const isSelected = selectedPlayers.includes(player);
              const color = getPlayerColor(player);
              return (
                <div
                  key={player}
                  onClick={() => handleTogglePlayer(player)}
                  className="chip"
                  style={
                    {
                      ["--chip-border" as any]: isSelected
                        ? color
                        : "var(--surface-border)",
                      ["--chip-bg" as any]: isSelected
                        ? `${color}15`
                        : "var(--surface)",
                      ["--chip-color" as any]: isSelected
                        ? color
                        : "var(--neutral-600)",
                      ["--chip-fw" as any]: isSelected ? "700" : "400",
                      ["--chip-dot" as any]: isSelected
                        ? color
                        : "var(--surface-border)",
                    } as CSSProperties
                  }
                >
                  <div className="dot" />
                  {player}
                </div>
              );
            })}
          </div>
        </div>

        {/* ÁREA DE LA GRÁFICA */}
        {selectedPlayers.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center bg-light rounded text-muted p-5 border empty-chart">
            <p className="mb-0">
              ⚠️ Toca algún jugador arriba para comenzar la comparativa.
            </p>
          </div>
        ) : (
          /* Contenedor que permite Scroll Horizontal en móvil */
          <div className="chart-scroll">
            <div className="chart-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--surface-border)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-2)",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-2)", fontSize: 12 }}
                    domain={["auto", "auto"]} // Ajusta la escala automáticamente
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                      padding: "12px",
                    }}
                    labelStyle={{
                      fontWeight: "900",
                      color: "var(--text)",
                      marginBottom: "8px",
                      borderBottom: "1px solid var(--surface-border)",
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
                          : { strokeWidth: 2, r: 4, fill: "var(--surface)" }
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
