import React, { useState, useEffect } from "react";
import { data } from "../data/data.ts"; // tu data.ts
import { Apodos } from "../models/models.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

// Tipo de jornada
type JornadaJugador = {
  jugador: Apodos;
  puntos: number;
  pago?: number;
  posicion?: number;
};

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState(1);
  const [jornada, setJornada] = useState<JornadaJugador[]>([]);

  // Todos los jugadores del torneo
  const todosJugadores = Object.values(Apodos);

  // Tabla de pagos
  const pagos11: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 2,
    7: 4,
    8: 5,
    9: 6,
    10: 7,
    11: 8,
  };
  const pagos10: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 2,
    6: 4,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
  };
  const getPagosPorPosicion = (numJornada: number) =>
    numJornada <= 2 ? pagos11 : pagos10;

  // Cuando cambia la jornada seleccionada, calculamos
  useEffect(() => {
    setJornada(calcularAcumulado(selectedJornada, selectedJornada));
  }, [selectedJornada]);

  // Calcular posiciones y pagos
  const calcularPosiciones = (lista: JornadaJugador[], numJornada: number) => {
    const pagosPorPosicion = getPagosPorPosicion(numJornada);

    // ordenar por puntos descendente
    const ordenada = [...lista].sort((a, b) => b.puntos - a.puntos);
    let lastPuntos: number | null = null;
    let lastPosicion = 0;

    const conPosiciones = ordenada.map((j, idx) => {
      if (j.puntos === lastPuntos) return { ...j, posicion: lastPosicion };
      lastPosicion = idx + 1;
      lastPuntos = j.puntos;
      return { ...j, posicion: lastPosicion };
    });

    return conPosiciones.map((jugador) => {
      const empatados = conPosiciones.filter(
        (j) => j.puntos === jugador.puntos
      );
      if (empatados.length > 1) {
        const sumPagos = empatados.reduce(
          (acc, j) => acc + (pagosPorPosicion[j.posicion] || 0),
          0
        );
        return { ...jugador, pago: sumPagos / empatados.length };
      }
      return { ...jugador, pago: pagosPorPosicion[jugador.posicion] || 0 };
    });
  };

  const getColorByPago = (pago: number) => {
    const colores: Record<number, string> = {
      0: "#f0fff0", // verde muy clarito
      1: "#fff5f5", // rojo extremadamente suave
      2: "#ffecec",
      3: "#ffe0e0",
      4: "#ffcccc",
      5: "#ffb3b3",
      6: "#ff9999",
      7: "#ff7f7f",
      8: "#ff6666", // máximo pago
    };

    const pagoEntero = Math.round(pago);
    return colores[pagoEntero] || "#ff6666"; // color por defecto si supera los pagos
  };

  return (
    <div className="panelContainer">
      <div className="card">
        <h2 className="title">Jornada {selectedJornada}</h2>
        <div className="selectWrapper">
          <select
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(Number(e.target.value))}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Jornada {j}
              </option>
            ))}
          </select>
        </div>

        <div className="tableWrapper">
          {jornada.every((j) => j.puntos === 0) ? (
            <div className="spinnerWrapper">
              <img
                src="../imagenes/spinner.jp"
                alt="Jornada no jugada"
                className="rotatingImage"
              />
              <p>Jornada aún no jugada</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Jugador</th>
                  <th>Puntos</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {jornada.map((j, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor:
                        getColorByPago(j.pago ?? 0) + " !important",
                    }}
                  >
                    <td
                      style={{ backgroundColor: getColorByPago(j.pago ?? 0) }}
                    >
                      {j.posicion}
                    </td>
                    <td
                      style={{ backgroundColor: getColorByPago(j.pago ?? 0) }}
                    >
                      {j.jugador}
                    </td>
                    <td
                      style={{ backgroundColor: getColorByPago(j.pago ?? 0) }}
                    >
                      {j.puntos}
                    </td>
                    <td
                      style={{ backgroundColor: getColorByPago(j.pago ?? 0) }}
                    >
                      {j.pago} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
