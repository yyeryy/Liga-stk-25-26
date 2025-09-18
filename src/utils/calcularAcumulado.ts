import { Apodos } from "../models/models.ts";

export type JugadorPago = {
  jugador: Apodos;
  puntos: number;
  pago: number;
  posicion: number;
};

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
 * Calcula puntos y pagos acumulados de los jugadores en un rango de jornadas.
 */
export const calcularAcumulado = (
  jornadas: typeof import("../data/data.ts").data.jornadas,
  desde: number,
  hasta: number,
  esEstadistica?: boolean
): JugadorPago[] => {
  const todosJugadores = Object.values(Apodos);

  let jugadoresFiltrados = [...todosJugadores];

  if (!esEstadistica) {
    if (desde == 1 && hasta == 38) {
      jugadoresFiltrados = jugadoresFiltrados.filter(
        (j) => j !== Apodos.Zarrakatz && j !== Apodos.Polfovich
      );
    } else {
      if (desde > 2 || (desde == 1 && hasta == 5)) {
        jugadoresFiltrados = jugadoresFiltrados.filter(
          (j) => j !== Apodos.Zarrakatz
        );
      }
      if (desde > 4 || (desde == 1 && hasta == 5)) {
        jugadoresFiltrados = jugadoresFiltrados.filter(
          (j) => j !== Apodos.Polfovich
        );
      }
      if (desde < 5 && !(desde == 1 && hasta == 5)) {
        jugadoresFiltrados = jugadoresFiltrados.filter(
          (j) => j !== Apodos.Pitxu15pesos
        );
      }
    }
  }

  const acumulado: Record<string, JugadorPago> = {};
  jugadoresFiltrados.forEach((j) => {
    acumulado[j] = { jugador: j, puntos: 0, pago: 0, posicion: 0 };
  });

  const jornadasDelRango = jornadas.filter(
    (j) => j.numero >= desde && j.numero <= hasta
  );

  jornadasDelRango.forEach((jornada) => {
    const resultados = Array.isArray(jornada.resultados)
      ? [...jornada.resultados].sort((a, b) => b.puntos - a.puntos)
      : [];

    if (resultados.length === 0) return;

    const pagosPos = getPagosPorPosicion(jornada.numero);

    // Calcular posiciones de la jornada
    let lastPuntos: number | null = null;
    let lastPos = 0;
    const conPosiciones = resultados
      .map((r, idx) => {
        if (!r) return null;
        // posición real siempre idx + 1 (no repetir)
        return { ...r, posicion: idx + 1 };
      })
      .filter(
        (r): r is { jugador: Apodos; puntos: number; posicion: number } => !!r
      );

    conPosiciones.forEach((r) => {
      if (!acumulado[r.jugador]) return;

      const empatados = conPosiciones.filter((x) => x.puntos === r.puntos);
      const pago =
        empatados.length > 1
          ? empatados.reduce((acc, x) => acc + (pagosPos[x.posicion] || 0), 0) /
            empatados.length
          : pagosPos[r.posicion] || 0;

      acumulado[r.jugador].puntos += r.puntos;
      acumulado[r.jugador].pago += pago;
    });
  });

  if ((desde == 1 && hasta == 38) || (desde == 1 && hasta == 5))
    acumulado[Apodos.Pitxu15pesos].pago += 12;

  // Calcular posiciones finales del rango
  const listaFinal = Object.values(acumulado).sort(
    (a, b) => b.puntos - a.puntos
  );
  let lastPuntos: number | null = null;
  let lastPos = 0;
  listaFinal.forEach((j, idx) => {
    if (j.puntos === lastPuntos) {
      j.posicion = lastPos;
    } else {
      lastPos = idx + 1;
      lastPuntos = j.puntos;
      j.posicion = lastPos;
    }
  });

  return listaFinal;
};
