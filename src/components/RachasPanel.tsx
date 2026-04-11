import React, { useMemo, useState } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import Badge from "react-bootstrap/Badge";
import "./RachasPanel.css";

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

    const activos = Object.values(Apodos).filter(
      (j) => j !== Apodos.Zarrakatz && j !== Apodos.Polfovich,
    );

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

      return {
        jugador,
        puntosEnForma,
        racha,
      };
    });

    return {
      jornadas: ultimasX.map((j) => j.numero),
      jugadores: historialJugadores.sort(
        (a, b) => b.puntosEnForma - a.puntosEnForma,
      ),
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
    if (resultado.pago > 0) classes += " rachas-dot--paid";
    else if (typeof posNum === "number" && posNum <= 3)
      classes += " rachas-dot--podium";
    else classes += " rachas-dot--avg";

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
          <select
            value={numJornadas}
            onChange={(e) => setNumJornadas(Number(e.target.value))}
            className="select-primary rachas-select"
          >
            <option value={5}>Últimas 5 Jornadas</option>
            <option value={10}>Últimas 10 Jornadas</option>
            <option value={15}>Últimas 15 Jornadas</option>
          </select>
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
          {rachasData.jugadores.map((jugador, idx) => (
            <div
              key={jugador.jugador}
              className={`rachas-item ${idx === 0 ? "rachas-item--top" : ""}`}
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
          ))}
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4 text-muted rachas-legend--bottom">
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot podio">●</span> Podio
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot avg">●</span> Media
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="legend-dot paid">●</span> Paga
          </div>
        </div>
      </div>
    </div>
  );
};
