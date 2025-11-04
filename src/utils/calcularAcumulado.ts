import { data } from "../data/data.ts";
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

const pagos10v1: Record<number, number> = {
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

const pagos10v2: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 2,
  7: 3,
  8: 4,
  9: 5,
  10: 6,
};

const pagos9v1: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 2,
  6: 4,
  7: 5,
  8: 6,
  9: 7,
};

const pagos9v2: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 2,
  7: 3,
  8: 4,
  9: 5,
};

const getPagosPorPosicion = (numJornada: number) => {
  if (numJornada <= 2) return pagos11;
  if (numJornada <= 5) return pagos10v1;
  if (numJornada <= 7) return pagos9v1;
  if (numJornada <= 10) return pagos10v2;
  return pagos9v2;
};

/**
 * Calcula puntos y pagos acumulados de los jugadores en un rango de jornadas.
 */
export const calcularAcumulado = (
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
      if ((desde === 6 && hasta === 6) || (desde === 7 && hasta === 7)) {
        jugadoresFiltrados = jugadoresFiltrados.filter(
          (j) => j !== Apodos.ElManito
        );
      }
      if (desde > 10) {
        jugadoresFiltrados = jugadoresFiltrados.filter(
          (j) => j !== Apodos.Dennis
        );
      }
    }
  }

  const acumulado: Record<string, JugadorPago> = {};
  jugadoresFiltrados.forEach((j) => {
    acumulado[j] = { jugador: j, puntos: 0, pago: 0, posicion: 0 };
  });

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= desde && j.numero <= hasta
  );

  jornadasDelRango.forEach((jornada) => {
    const resultados = Array.isArray(jornada.resultados)
      ? [...jornada.resultados].sort((a, b) => b.puntos - a.puntos)
      : [];

    if (resultados.length === 0) return;

    const pagosPos = getPagosPorPosicion(jornada.numero);

    const factor = jornada.numero % 5 === 0 ? 2 : 1;

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
          ? (empatados.reduce(
              (acc, x) => acc + (pagosPos[x.posicion] || 0),
              0
            ) /
              empatados.length) *
            factor
          : (pagosPos[r.posicion] || 0) * factor;

      acumulado[r.jugador].puntos += r.puntos;
      acumulado[r.jugador].pago += pago;
    });
  });

  if ((desde == 1 && hasta == 38) || (desde == 1 && hasta == 5))
    acumulado[Apodos.Pitxu15pesos].pago += 12;

  if ((desde == 1 && hasta == 38) || (desde == 6 && hasta == 10))
    acumulado[Apodos.ElManito].pago += 5;

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

// Devuelve el máximo de puntos por jugador en un rango de jornadas
export const obtenerMaximos = (): Record<Apodos, number> => {
  const maximos: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (maximos[j] = 0));

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= 1 && j.numero <= 38
  );

  jornadasDelRango.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    jornada.resultados.forEach((r) => {
      if (!r) return;
      maximos[r.jugador] = Math.max(maximos[r.jugador] ?? 0, r.puntos);
    });
  });

  return maximos;
};

// Devuelve el mínimo de puntos por jugador en un rango de jornadas
export const obtenerMinimos = (): Record<Apodos, number> => {
  const minimos: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (minimos[j] = Infinity));

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= 1 && j.numero <= 38
  );

  jornadasDelRango.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    jornada.resultados.forEach((r) => {
      if (!r) return;
      minimos[r.jugador] = Math.min(minimos[r.jugador] ?? Infinity, r.puntos);
    });
  });

  return minimos;
};

export const obtenerPromedios = (): Record<Apodos, number> => {
  const sumas: Record<Apodos, number> = {} as Record<Apodos, number>;
  const conteos: Record<Apodos, number> = {} as Record<Apodos, number>;

  Object.values(Apodos).forEach((j) => {
    sumas[j] = 0;
    conteos[j] = 0;
  });

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= 1 && j.numero <= 38
  );

  jornadasDelRango.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    jornada.resultados.forEach((r) => {
      if (!r) return;
      sumas[r.jugador] += r.puntos;
      conteos[r.jugador] += 1;
    });
  });

  const promedios: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => {
    promedios[j] = conteos[j] > 0 ? sumas[j] / conteos[j] : 0;
  });

  return promedios;
};

export const vecesTop1 = (): Record<Apodos, number> => {
  const top1: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (top1[j] = 0));

  data.jornadas.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados) || jornada.resultados.length === 0)
      return;

    const resultados = [...jornada.resultados].sort(
      (a, b) => b.puntos - a.puntos
    );

    // puntos máximos de la jornada
    const maxPuntos = resultados[0].puntos;
    // incrementa a todos los que tienen esos puntos (empate en 1º)
    resultados
      .filter((r) => r.puntos === maxPuntos)
      .forEach((r) => {
        top1[r.jugador]++;
      });
  });

  return top1;
};

// Veces en el top 3 (teniendo en cuenta empates)
export const vecesTop3 = (): Record<Apodos, number> => {
  const top3: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (top3[j] = 0));

  data.jornadas.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados) || jornada.resultados.length === 0)
      return;

    const resultados = [...jornada.resultados].sort(
      (a, b) => b.puntos - a.puntos
    );

    // Asignamos posiciones con manejo de empates: si puntos iguales -> misma posición
    let lastPuntos: number | null = null;
    let lastPos = 0;
    resultados.forEach((r, idx) => {
      const posicion = r.puntos === lastPuntos ? lastPos : idx + 1;
      lastPuntos = r.puntos;
      lastPos = posicion;

      if (posicion <= 3) top3[r.jugador]++;
    });
  });

  return top3;
};

// Jornadas libradas (pagando 0)
export const jornadasLibradas = (): Record<Apodos, number> => {
  const libradas: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (libradas[j] = 0));

  data.jornadas.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    const pagosPos = getPagosPorPosicion(jornada.numero);

    jornada.resultados.forEach((r, idx) => {
      if (!r) return;

      // obtener el pago real del jugador en esa jornada
      const pagoJugador = pagosPos[idx + 1] ?? 0; // idx +1 porque las posiciones empiezan en 1
      if (pagoJugador === 0) libradas[r.jugador]++;
    });
  });

  return libradas;
};
