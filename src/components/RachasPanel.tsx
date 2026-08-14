import React, { useMemo, useState } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import Badge from "react-bootstrap/Badge";
import "./RachasPanel.css";
import CustomSelect from "./CustomSelect.tsx";

export const RachasPanel = () => {
  const [numJornadas, setNumJornadas] = useState<number>(5);

  const rachasData = useMemo(() => {
    const jornadasJugadas = data.jornadas.filter((j) =>
      j.resultados.some((r) => r.puntos > 0),
    );

    const ultimasX = jornadasJugadas.slice(-numJornadas);

    const resultadosPorJornada = ultimasX.map((j) => ({
      numero: j.numero,
      clasificacion: calcularAcumulado(j.numero, j.numero),
    }));

    const activos = Object.values(Apodos);

    const historialJugadores = activos.map((jugador) => {
      let puntosEnForma = 0;

      const racha = resultadosPorJornada.map((jornada) => {
        const resJugador = jornada.clasificacion.find(
          (r) => r.jugador === jugador,
        );

        if (resJugador) {
          puntosEnForma += resJugador.puntos;
        }

        return {
          jornada: jornada.numero,
          puntos: resJugador?.puntos || 0,
          posicion: resJugador?.posicion || "-",
          pago: resJugador?.pago || 0,
        };
      });

      const totalPago = racha.reduce((s, r) => s + (r.pago || 0), 0);

      return {
        jugador,
        puntosEnForma,
        racha,
        totalPago,
      };
    });

    const jugadoresOrdenados = historialJugadores.sort(
      (a, b) => b.puntosEnForma - a.puntosEnForma,
    );

    const maxPago = Math.max(
      ...jugadoresOrdenados.map((p) => p.totalPago || 0),
      0,
    );

    return {
      jornadas: ultimasX.map((j) => j.numero),
      jugadores: jugadoresOrdenados,
      maxPago,
    };
  }, [numJornadas]);

  const renderBolita = (resultado: {
    posicion: number | string;
    pago: number;
    jornada: number;
    puntos: number;
  }) => {
    if (resultado.posicion === "-") {
      return (
        <div
          key={resultado.jornada}
          className="rachas-dot rachas-dot--empty"
          title={`Jornada ${resultado.jornada}: ${resultado.puntos} pts`}
        >
          -
        </div>
      );
    }

    const posNum =
      typeof resultado.posicion === "number" ? resultado.posicion : undefined;
    let classes = "rachas-dot";
    // Priorizar pagos (rojo). Si no hay pago, colorear según posición: oro/plata/bronce/gris (4º).
    if (resultado.pago > 0) classes += " rachas-dot--paid";
    else if (posNum === 1) classes += " rachas-dot--gold";
    else if (posNum === 2) classes += " rachas-dot--silver";
    else if (posNum === 3) classes += " rachas-dot--bronze";
    else if (posNum === 4) classes += " rachas-dot--fourth";
    else classes += " rachas-dot--neutral";

    return (
      <div
        key={resultado.jornada}
        title={`Jornada ${resultado.jornada}: ${resultado.puntos} pts`}
        className={classes}
      >
        {resultado.posicion}
      </div>
    );
  };

  if (rachasData.jornadas.length === 0) {
    return (
      <div className="p-4 text-center">Aún no hay jornadas disputadas.</div>
    );
  }

  const mvp = rachasData.jugadores[0];

  return (
    <div className="rachas-panel">
      <div className="panel rachas-content panel-screen">
        <h2 className="h2">🔥 Estado de Forma</h2>

        <div className="rachas-controls">
          <CustomSelect
            id="rachas-num"
            value={String(numJornadas)}
            onChange={(v) => setNumJornadas(Number(v))}
            options={[
              { value: "5", label: "Últimas 5 Jornadas" },
              { value: "10", label: "Últimas 10 Jornadas" },
              { value: "15", label: "Últimas 15 Jornadas" },
            ]}
            className="select-primary rachas-select"
            placeholder="Últimas Jornadas"
          />
        </div>

        {mvp && (
          <div className="rachas-mvp">
            <div>
              <div className="rachas-mvp__label">MVP del momento</div>
              <div className="rachas-mvp__name">{mvp.jugador}</div>
            </div>
            <div className="text-end">
              <div className="rachas-mvp__score">{mvp.puntosEnForma}</div>
              <div className="rachas-mvp__meta">
                pts en {numJornadas} Jorns.
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end mb-2 gap-1 text-muted rachas-legend">
          {rachasData.jornadas.map((j) => (
            <div key={j} className="rachas-legend__item">
              J{j}
            </div>
          ))}
        </div>

        <div className="rachas-list">
          {rachasData.jugadores.map((jugador, idx) => {
            const medalClass =
              idx === 0
                ? "rachas-item--gold"
                : idx === 1
                  ? "rachas-item--silver"
                  : idx === 2
                    ? "rachas-item--bronze"
                    : idx === 3
                      ? "rachas-item--fourth"
                      : "";

            const borderLeftWidth =
              rachasData.maxPago && jugador.totalPago > 0
                ? Math.max(
                    2,
                    Math.round((jugador.totalPago / rachasData.maxPago) * 6),
                  )
                : 0;

            return (
              <div
                key={jugador.jugador}
                className={`rachas-item ${medalClass}`}
                style={
                  borderLeftWidth
                    ? { borderLeft: `${borderLeftWidth}px solid var(--danger)` }
                    : undefined
                }
              >
                <div className="rachas-item__header">
                  <div className="rachas-rank">{idx + 1}</div>
                  <div
                    className={`rachas-player ${idx === 0 ? "rachas-player--top" : ""}`}
                  >
                    {jugador.jugador}
                  </div>
                </div>

                <div className="rachas-item__footer">
                  <Badge
                    bg="light"
                    text="dark"
                    className="border rachas-score-badge"
                  >
                    {jugador.puntosEnForma} pts
                  </Badge>

                  <div className="rachas-dots">
                    {jugador.racha.map((resultado) => renderBolita(resultado))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4 text-muted rachas-legend--bottom">
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot gold">●</span> Oro
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot silver">●</span> Plata
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot bronze">●</span> Bronce
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot fourth">●</span> 4º
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot paid">●</span> Paga
          </div>
        </div>
      </div>
    </div>
  );
};
