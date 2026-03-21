import React, { useMemo, useState } from "react";
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
            marginBottom: "20px",
            fontSize: "1.5rem",
          }}
        >
          ⚔️ Cara a Cara
        </h2>

        {/* Zona de Selectores */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "25px",
          }}
        >
          <select
            value={jugadorA}
            onChange={(e) => setJugadorA(e.target.value as Apodos)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "2px solid #3498db",
              fontWeight: "bold",
              color: "#2980b9",
              width: "100%",
              outline: "none",
              textAlign: "center",
            }}
          >
            <option value="">Selecciona Jugador 1...</option>
            {Object.values(Apodos).map((j) => (
              <option key={`A-${j}`} value={j} disabled={j === jugadorB}>
                {j}
              </option>
            ))}
          </select>

          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: "#bdc3c7",
              fontSize: "1.2rem",
              marginTop: "-5px",
              marginBottom: "-5px",
            }}
          >
            VS
          </div>

          <select
            value={jugadorB}
            onChange={(e) => setJugadorB(e.target.value as Apodos)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "2px solid #e74c3c",
              fontWeight: "bold",
              color: "#c0392b",
              width: "100%",
              outline: "none",
              textAlign: "center",
            }}
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
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "1px dashed #ced4da",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🥊</span>
            <h5 className="mt-2 text-muted">Elige a dos jugadores</h5>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              Compara sus puntos, deudas y averigua quién gana en el
              enfrentamiento directo.
            </p>
          </div>
        ) : (
          <div>
            {/* Diferencia Puntos Destacada */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#e8f4f8",
                borderRadius: "10px",
                border: "1px solid #d6eaf8",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#2980b9",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Diferencia en la general
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#2c3e50",
                  lineHeight: "1.2",
                }}
              >
                {difPuntos} pts
              </div>
              <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
                a favor de <strong style={{ color: "#2980b9" }}>{lider}</strong>
              </div>
            </div>

            {/* Tabla Comparativa estilo "Videojuego" */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid #eee",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {/* Nombres (Cabecera) */}
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#f8f9fa",
                  padding: "12px 0",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontWeight: "900",
                    color: "#3498db",
                    fontSize: "1.1rem",
                  }}
                >
                  {comparativa.datosA?.jugador}
                </div>
                <div
                  style={{
                    width: "20%",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "#adb5bd",
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  VS
                </div>
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontWeight: "900",
                    color: "#e74c3c",
                    fontSize: "1.1rem",
                  }}
                >
                  {comparativa.datosB?.jugador}
                </div>
              </div>

              {/* NUEVO: Fila: Jornadas Ganadas (INLINE) */}
              <div
                style={{
                  display: "flex",
                  padding: "15px 0",
                  borderBottom: "1px solid #eee",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: "900",
                    color:
                      comparativa.score.A > comparativa.score.B
                        ? "#f39c12"
                        : "#2c3e50",
                  }}
                >
                  {comparativa.score.A}
                </div>
                <div
                  style={{
                    width: "20%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      color: "#7f8c8d",
                      fontWeight: "bold",
                    }}
                  >
                    Ganadas
                  </span>
                  {comparativa.score.E > 0 && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "#adb5bd",
                        marginTop: "2px",
                      }}
                    >
                      {comparativa.score.E} empates
                    </span>
                  )}
                </div>
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: "900",
                    color:
                      comparativa.score.B > comparativa.score.A
                        ? "#f39c12"
                        : "#2c3e50",
                  }}
                >
                  {comparativa.score.B}
                </div>
              </div>

              {/* Fila: Ranking */}
              <div
                style={{
                  display: "flex",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color:
                      comparativa.posA < comparativa.posB
                        ? "#27ae60"
                        : "inherit",
                  }}
                >
                  #{comparativa.posA}
                </div>
                <div
                  style={{
                    width: "20%",
                    textAlign: "center",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    color: "#7f8c8d",
                    fontWeight: "bold",
                  }}
                >
                  Liga
                </div>
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color:
                      comparativa.posB < comparativa.posA
                        ? "#27ae60"
                        : "inherit",
                  }}
                >
                  #{comparativa.posB}
                </div>
              </div>

              {/* Fila: Puntos */}
              <div
                style={{
                  display: "flex",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color:
                      comparativa.datosA!.puntos > comparativa.datosB!.puntos
                        ? "#27ae60"
                        : "inherit",
                  }}
                >
                  {comparativa.datosA?.puntos}
                </div>
                <div
                  style={{
                    width: "20%",
                    textAlign: "center",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    color: "#7f8c8d",
                    fontWeight: "bold",
                  }}
                >
                  Pts
                </div>
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color:
                      comparativa.datosB!.puntos > comparativa.datosA!.puntos
                        ? "#27ae60"
                        : "inherit",
                  }}
                >
                  {comparativa.datosB?.puntos}
                </div>
              </div>

              {/* Fila: Deuda */}
              <div
                style={{
                  display: "flex",
                  padding: "12px 0",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: comparativa.datosA!.pago > 0 ? "#c0392b" : "#27ae60",
                  }}
                >
                  {comparativa.datosA?.pago.toFixed(2)}€
                </div>
                <div
                  style={{
                    width: "20%",
                    textAlign: "center",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    color: "#7f8c8d",
                    fontWeight: "bold",
                  }}
                >
                  Deuda
                </div>
                <div
                  style={{
                    width: "40%",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: comparativa.datosB!.pago > 0 ? "#c0392b" : "#27ae60",
                  }}
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
