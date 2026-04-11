import React, { useMemo, useState } from "react";
import "./CaraACara.css";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

export const CaraACaraPanel = () => {
  const [jugadorA, setJugadorA] = useState<Apodos | "">("");
  const [jugadorB, setJugadorB] = useState<Apodos | "">("");

  const comparativa = useMemo(() => {
    if (!jugadorA || !jugadorB || jugadorA === jugadorB) return null;

    const tablaGeneralA = calcularAcumulado(1, 38, true);

    const activosA = tablaGeneralA.filter(
      (j) => j.jugador !== Apodos.Zarrakatz && j.jugador !== Apodos.Polfovich,
    );

    const ordenadaA = [...activosA].sort((a, b) => b.puntos - a.puntos);

    let lastPuntos: number | null = null;
    let lastPos = 0;
    ordenadaA.forEach((j, idx) => {
      if (j.puntos === lastPuntos) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPuntos = j.puntos;
        j.posicion = lastPos;
      }
    });

    const datosA = tablaGeneralA.find((j) => j.jugador === jugadorA);
    const datosB = tablaGeneralA.find((j) => j.jugador === jugadorB);
    const posA = ordenadaA.find((j) => j.jugador === jugadorA)?.posicion ?? "-";
    const posB = ordenadaA.find((j) => j.jugador === jugadorB)?.posicion ?? "-";

    let victoriasA = 0;
    let victoriasB = 0;
    let empates = 0;

    data.jornadas.forEach((jornada) => {
      if (jornada.resultados.every((r) => r.puntos === 0)) return;

      const resA = jornada.resultados.find((r) => r.jugador === jugadorA);
      const resB = jornada.resultados.find((r) => r.jugador === jugadorB);

      if (resA && resB) {
        if (resA.puntos > resB.puntos) {
          victoriasA++;
        } else if (resB.puntos > resA.puntos) {
          victoriasB++;
        } else {
          empates++;
        }
      }
    });

    return {
      datosA,
      datosB,
      posA,
      posB,
      score: { A: victoriasA, B: victoriasB, E: empates },
    };
  }, [jugadorA, jugadorB]);

  const difPuntos = comparativa
    ? Math.abs(
        (comparativa.datosA?.puntos || 0) - (comparativa.datosB?.puntos || 0),
      )
    : 0;
  const lider =
    comparativa &&
    (comparativa.datosA?.puntos || 0) >= (comparativa.datosB?.puntos || 0)
      ? comparativa.datosA?.jugador
      : comparativa?.datosB?.jugador;

  return (
    <div className="cara-panel">
      <div className="panel panel-screen">
        <h2 className="h2">⚔️ Cara a Cara</h2>

        {/* Zona de Selectores */}
        <div className="selectors">
          <select
            value={jugadorA}
            onChange={(e) => setJugadorA(e.target.value as Apodos)}
            className="select-primary"
          >
            <option value="">Selecciona Jugador 1...</option>
            {Object.values(Apodos).map((j) => (
              <option key={`A-${j}`} value={j} disabled={j === jugadorB}>
                {j}
              </option>
            ))}
          </select>

          <div className="vs-label">VS</div>

          <select
            value={jugadorB}
            onChange={(e) => setJugadorB(e.target.value as Apodos)}
            className="select-primary select-danger"
          >
            <option value="">Selecciona Jugador 2...</option>
            {Object.values(Apodos).map((j) => (
              <option key={`B-${j}`} value={j} disabled={j === jugadorA}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* Resultados */}
        {!comparativa ? (
          <div className="empty-compare">
            <span className="icon">🥊</span>
            <h5 className="mt-2 text-muted">Elige a dos jugadores</h5>
            <p className="text-muted desc">
              Compara sus puntos, deudas y averigua quién gana en el
              enfrentamiento directo.
            </p>
          </div>
        ) : (
          <div>
            {/* Diferencia Puntos Destacada */}
            <div className="diff-card">
              <div className="label">Diferencia en la general</div>
              <div className="value">{difPuntos} pts</div>
              <div className="desc">
                a favor de <strong className="leader">{lider}</strong>
              </div>
            </div>

            {/* Tabla Comparativa estilo "Videojuego" */}
            <div className="compare-table">
              {/* Nombres (Cabecera) */}
              <div className="compare-header">
                <div className="col col-40 col-player-left">
                  {comparativa.datosA?.jugador}
                </div>
                <div className="col col-20">VS</div>
                <div className="col col-40 col-player-right">
                  {comparativa.datosB?.jugador}
                </div>
              </div>

              {/* NUEVO: Fila: Jornadas Ganadas (INLINE) */}
              <div className="row">
                <div
                  className={`value ${comparativa.score.A > comparativa.score.B ? "highlight" : ""}`}
                >
                  {comparativa.score.A}
                </div>
                <div className="label">
                  <span className="small-label">Ganadas</span>
                  {comparativa.score.E > 0 && (
                    <span className="small-meta">
                      {comparativa.score.E} empates
                    </span>
                  )}
                </div>
                <div
                  className={`value ${comparativa.score.B > comparativa.score.A ? "highlight" : ""}`}
                >
                  {comparativa.score.B}
                </div>
              </div>

              {/* Fila: Ranking */}
              <div className="row">
                <div
                  className={`value ${comparativa.posA < comparativa.posB ? "rank-positive" : ""}`}
                >
                  #{comparativa.posA}
                </div>
                <div className="label">
                  <span className="small-label">Liga</span>
                </div>
                <div
                  className={`value ${comparativa.posB < comparativa.posA ? "rank-positive" : ""}`}
                >
                  #{comparativa.posB}
                </div>
              </div>

              {/* Fila: Puntos */}
              <div className="row">
                <div
                  className={`value ${comparativa.datosA!.puntos > comparativa.datosB!.puntos ? "points-positive" : ""}`}
                >
                  {comparativa.datosA?.puntos}
                </div>
                <div className="label">
                  <span className="small-label">Pts</span>
                </div>
                <div
                  className={`value ${comparativa.datosB!.puntos > comparativa.datosA!.puntos ? "points-positive" : ""}`}
                >
                  {comparativa.datosB?.puntos}
                </div>
              </div>

              {/* Fila: Deuda */}
              <div className="row">
                <div
                  className={`value ${comparativa.datosA!.pago > 0 ? "debt-negative" : "debt-positive"}`}
                >
                  {comparativa.datosA?.pago.toFixed(2)}€
                </div>
                <div className="label">
                  <span className="small-label">Deuda</span>
                </div>
                <div
                  className={`value ${comparativa.datosB!.pago > 0 ? "debt-negative" : "debt-positive"}`}
                >
                  {comparativa.datosB?.pago.toFixed(2)}€
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
