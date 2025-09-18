import { Apodos } from "../models/models.ts";

export type JugadorPago = {
  jugador: Apodos;
  puntos: number;
  pago: number;
  posicion: number;
};

// Pagos por posición
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

/**
 * Calcula posiciones y pagos de una lista de resultados de jornada.
 * Reutilizable para jornadas individuales o bloques acumulados.
 */
export const calcularPosiciones = (
  lista: { jugador: Apodos; puntos: number }[],
  numJornada: number
): JugadorPago[] => {
  const pagosPorPosicion = getPagosPorPosicion(numJornada);

  // ordenar por puntos descendente
  const ordenada = [...lista].sort((a, b) => b.puntos - a.puntos);

  const conPosiciones: JugadorPago[] = [];
  let idx = 0;

  while (idx < ordenada.length) {
    const currentPuntos = ordenada[idx].puntos;
    const mismoPuntos: typeof ordenada = [];

    // agrupar empatados consecutivos
    let j = idx;
    while (j < ordenada.length && ordenada[j].puntos === currentPuntos) {
      mismoPuntos.push(ordenada[j]);
      j++;
    }

    // posiciones reales para los empatados
    const posiciones = Array.from(
      { length: mismoPuntos.length },
      (_, i) => idx + i + 1
    );

    // calcular pago promedio
    const sumPagos = posiciones.reduce(
      (acc, pos) => acc + (pagosPorPosicion[pos] || 0),
      0
    );
    const pagoEmpatado = sumPagos / mismoPuntos.length;

    // asignar posiciones y pago
    mismoPuntos.forEach((jugador, i) => {
      conPosiciones.push({
        jugador: jugador.jugador,
        puntos: jugador.puntos,
        posicion: posiciones[i],
        pago: pagoEmpatado,
      });
    });

    idx += mismoPuntos.length; // avanzar al siguiente grupo
  }

  return conPosiciones;
};
