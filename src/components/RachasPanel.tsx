import React, { useMemo, useState } from "react";
import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import Badge from "react-bootstrap/Badge";

export const RachasPanel = () => {
  // NUEVO: Estado para controlar cuántas jornadas vemos
  const [numJornadas, setNumJornadas] = useState<number>(5);

  const rachasData = useMemo(() => {
    const jornadasJugadas = data.jornadas.filter((j) =>
      j.resultados.some((r) => r.puntos > 0),
    );

    // NUEVO: Cortamos el array usando el estado numJornadas en lugar de un 5 fijo
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
  }, [numJornadas]); // NUEVO: Añadimos numJornadas a las dependencias del useMemo

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
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#f8f9fa",
            color: "#adb5bd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: "bold",
            border: "1px solid #dee2e6",
          }}
        >
          -
        </div>
      );
    }

    let bgColor = "#95a5a6";

    if (typeof resultado.posicion === "number" && resultado.posicion <= 3)
      bgColor = "#27ae60";
    if (resultado.pago > 0) bgColor = "#e74c3c";

    return (
      <div
        key={resultado.jornada}
        title={`Jornada ${resultado.jornada}: ${resultado.puntos} pts`}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: bgColor,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: "bold",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
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
          padding: "20px",
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
          🔥 Estado de Forma
        </h2>

        {/* NUEVO: Selector de jornadas */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "25px",
          }}
        >
          <select
            value={numJornadas}
            onChange={(e) => setNumJornadas(Number(e.target.value))}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid #f39c12",
              backgroundColor: "white",
              fontWeight: "bold",
              color: "#d35400",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={5}>Últimas 5 Jornadas</option>
            <option value={10}>Últimas 10 Jornadas</option>
            <option value={15}>Últimas 15 Jornadas</option>
          </select>
        </div>

        {/* Tarjeta del MVP Actual */}
        {mvp && (
          <div
            style={{
              background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
              borderRadius: "12px",
              padding: "15px",
              color: "white",
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 10px rgba(253, 160, 133, 0.4)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  opacity: 0.9,
                }}
              >
                MVP del momento
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: "bolder" }}>
                {mvp.jugador}
              </div>
            </div>
            <div className="text-end">
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "black",
                  lineHeight: "1",
                }}
              >
                {mvp.puntosEnForma}
              </div>
              {/* NUEVO: El texto de la tarjeta ahora es dinámico */}
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                pts en {numJornadas} Jorns.
              </div>
            </div>
          </div>
        )}

        {/* Leyenda de las jornadas - Añadido flexWrap para que salten de línea si son muchas */}
        <div
          className="d-flex justify-content-end mb-2 gap-1 text-muted"
          style={{ fontSize: "0.65rem", paddingRight: "5px", flexWrap: "wrap" }}
        >
          {rachasData.jornadas.map((j) => (
            <div
              key={j}
              style={{ width: "28px", textAlign: "center", fontWeight: "bold" }}
            >
              J{j}
            </div>
          ))}
        </div>

        {/* Tabla de Rachas "APILADA" */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rachasData.jugadores.map((jugador, idx) => (
            <div
              key={jugador.jugador}
              style={{
                backgroundColor: idx === 0 ? "#fffcf0" : "#f8f9fa",
                border: idx === 0 ? "1px solid #fde08b" : "1px solid #eee",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    fontWeight: "bold",
                    color: "#7f8c8d",
                    fontSize: "0.9rem",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div
                  style={{
                    fontWeight: idx === 0 ? "bold" : "600",
                    color: "#2c3e50",
                    fontSize: "1rem",
                    whiteSpace: "normal",
                    overflow: "visible",
                  }}
                >
                  {jugador.jugador}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  borderTop: "1px solid #eee",
                  paddingTop: "12px",
                }}
              >
                <Badge
                  bg="light"
                  text="dark"
                  className="border"
                  style={{
                    minWidth: "50px",
                    fontSize: "0.8rem",
                    textAlign: "center",
                  }}
                >
                  {jugador.puntosEnForma} pts
                </Badge>

                {/* NUEVO: Añadido flexWrap para evitar que 15 bolitas rompan la pantalla en móvil */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {jugador.racha.map((resultado) => renderBolita(resultado))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="d-flex justify-content-center gap-3 mt-4 text-muted"
          style={{ fontSize: "0.75rem" }}
        >
          <div className="d-flex align-items-center gap-1">
            <span style={{ color: "#27ae60" }}>●</span> Podio
          </div>
          <div className="d-flex align-items-center gap-1">
            <span style={{ color: "#95a5a6" }}>●</span> Media
          </div>
          <div className="d-flex align-items-center gap-1">
            <span style={{ color: "#e74c3c" }}>●</span> Paga
          </div>
        </div>
      </div>
    </div>
  );
};
