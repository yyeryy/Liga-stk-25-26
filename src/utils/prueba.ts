import { Apodos } from "../models/models.ts";
import { data } from "../data/data.ts";

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

type JugadorPago = {
  jugador: Apodos;
  puntos: number;
  pago: number;
  posicion: number;
};

// Calcula posiciones y pagos para una jornada
function calcularJornada(
  jornadaNum: number,
  resultados: { jugador: Apodos; puntos: number }[]
): JugadorPago[] {
  const pagosPorPos = getPagosPorPosicion(jornadaNum);
  const ordenada = [...resultados].sort((a, b) => b.puntos - a.puntos);

  const conPosiciones: JugadorPago[] = [];
  let idx = 0;

  while (idx < ordenada.length) {
    const mismoPuntos = ordenada.filter(
      (j, i) => j.puntos === ordenada[idx].puntos && i >= idx
    );
    const posiciones = Array.from(
      { length: mismoPuntos.length },
      (_, i) => idx + i + 1
    );
    const sumPagos = posiciones.reduce(
      (acc, pos) => acc + (pagosPorPos[pos] || 0),
      0
    );
    const pagoEmpatado = sumPagos / mismoPuntos.length;

    mismoPuntos.forEach((j, i) => {
      conPosiciones.push({
        jugador: j.jugador,
        puntos: j.puntos,
        posicion: posiciones[i],
        pago: pagoEmpatado,
      });
    });

    idx += mismoPuntos.length;
  }

  return conPosiciones;
}

// Generar datos generales y por bloques
export const generarDatos = () => {
  const dataGeneral: JugadorPago[] = [];
  const bloques: {
    desde: number;
    hasta: number;
    nombre: string;
    jugadores: JugadorPago[];
  }[] = [
    { desde: 1, hasta: 5, nombre: "Jornadas 1-5", jugadores: [] },
    { desde: 6, hasta: 10, nombre: "Jornadas 6-10", jugadores: [] },
    // ... más bloques
  ];

  const acumulado: Record<Apodos, JugadorPago> = {} as Record<
    Apodos,
    JugadorPago
  >;

  Object.values(Apodos).forEach((j) => {
    acumulado[j] = { jugador: j, puntos: 0, pago: 0, posicion: 0 };
  });

  data.jornadas.forEach((jornada) => {
    const res = calcularJornada(jornada.numero, jornada.resultados);
    // Acumular en general
    res.forEach((r) => {
      acumulado[r.jugador].puntos += r.puntos;
      acumulado[r.jugador].pago += r.pago;
    });
    // Guardar res por jornada si quieres
  });

  // Generar lista general ordenada por pago
  const listaGeneral = Object.values(acumulado)
    .sort((a, b) => b.pago - a.pago)
    .map((j, idx, arr) => ({ ...j, posicion: idx + 1 }));

  // Calcular bloques
  bloques.forEach((bloque) => {
    const bloqueAcum: Record<Apodos, JugadorPago> = {} as Record<
      Apodos,
      JugadorPago
    >;

    Object.values(Apodos).forEach((j) => {
      bloqueAcum[j] = { jugador: j, puntos: 0, pago: 0, posicion: 0 };
    });

    data.jornadas
      .filter((j) => j.numero >= bloque.desde && j.numero <= bloque.hasta)
      .forEach((jornada) => {
        const res = calcularJornada(jornada.numero, jornada.resultados);
        res.forEach((r) => {
          bloqueAcum[r.jugador].puntos += r.puntos;
          bloqueAcum[r.jugador].pago += r.pago;
        });
      });

    bloque.jugadores = Object.values(bloqueAcum)
      .sort((a, b) => b.pago - a.pago)
      .map((j, idx) => ({ ...j, posicion: idx + 1 }));
  });

  return { listaGeneral, bloques };
};
