const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const modelsPath = path.join(root, "src", "models", "models.ts");
const dataPath = path.join(root, "src", "data", "data.ts");
const outPath = path.join(root, "src", "data", "historico25_26.ts");

const modelsSrc = fs.readFileSync(modelsPath, "utf8");
// parse Apodos enum mapping
const apodosBlock = modelsSrc.match(/export enum Apodos \{([\s\S]*?)\}/);
const mapping = {};
if (apodosBlock) {
  const lines = apodosBlock[1].split(/\r?\n/);
  for (let l of lines) {
    l = l.trim();
    if (!l) continue;
    const m = l.match(/^(\w+) = \"([^"]+)\"/);
    if (m) mapping[m[1]] = m[2];
  }
}

let dataSrc = fs.readFileSync(dataPath, "utf8");
// remove import lines
dataSrc = dataSrc.replace(/import[^;]*;\s*/g, "");
// replace Apodos.X with string literal
Object.keys(mapping).forEach((k) => {
  const v = mapping[k];
  const re = new RegExp("Apodos\\." + k, "g");
  dataSrc = dataSrc.replace(re, `"${v}"`);
});
// turn export const data into const data
dataSrc = dataSrc.replace(/export const data\s*=\s*/, "const data = ");
// append export for node
const tmpPath = path.join(root, "scripts", "tmp_data_for_calc.js");
fs.writeFileSync(tmpPath, dataSrc + "\nmodule.exports = { data };", "utf8");

const dataModule = require(tmpPath);
const data = dataModule.data;
// cleanup tmp
fs.unlinkSync(tmpPath);

// replicate calcularAcumulado logic (simplified port)
const pagos11 = {
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
const pagos10v1 = {
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
const pagos10v2 = {
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
const pagos9v1 = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 4, 7: 5, 8: 6, 9: 7 };

const getPagosPorPosicion = (numJornada) => {
  if (numJornada <= 2) return pagos11;
  if (numJornada <= 5) return pagos10v1;
  if (numJornada <= 7) return pagos9v1;
  return pagos10v2;
};

// build list of all players from models mapping values
const todosJugadores = Object.values(mapping);

const calcularAcumuladoSimple = (desde, hasta) => {
  let jugadoresFiltrados = [...todosJugadores];
  // replicate exclusion logic minimally: keep all for full season
  if (desde === 1 && hasta === 38) {
    jugadoresFiltrados = jugadoresFiltrados.filter(
      (j) => j !== mapping["Zarrakatz"] && j !== mapping["Polfovich"],
    );
  }

  const acumulado = {};
  jugadoresFiltrados.forEach((j) => {
    acumulado[j] = { jugador: j, puntos: 0, pago: 0, posicion: 0 };
  });

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= desde && j.numero <= hasta,
  );

  jornadasDelRango.forEach((jornada) => {
    const resultados = Array.isArray(jornada.resultados)
      ? [...jornada.resultados].sort((a, b) => b.puntos - a.puntos)
      : [];
    if (resultados.length === 0) return;
    const pagosPos = getPagosPorPosicion(jornada.numero);
    const factor = jornada.numero === 38 ? 3 : jornada.numero % 5 === 0 ? 2 : 1;

    const conPosiciones = resultados
      .map((r, idx) => (r ? { ...r, posicion: idx + 1 } : null))
      .filter(Boolean);
    conPosiciones.forEach((r) => {
      if (!acumulado[r.jugador]) return;
      const empatados = conPosiciones.filter((x) => x.puntos === r.puntos);
      const pago =
        empatados.length > 1
          ? (empatados.reduce(
              (acc, x) => acc + (pagosPos[x.posicion] || 0),
              0,
            ) /
              empatados.length) *
            factor
          : (pagosPos[r.posicion] || 0) * factor;
      acumulado[r.jugador].puntos += r.puntos;
      acumulado[r.jugador].pago += pago;
    });
  });

  if ((desde === 1 && hasta === 38) || (desde === 1 && hasta === 5))
    acumulado[mapping["Pitxu15pesos"]] &&
      (acumulado[mapping["Pitxu15pesos"]].pago += 12);
  if ((desde === 1 && hasta === 38) || (desde === 6 && hasta === 10))
    acumulado[mapping["ElManito"]] &&
      (acumulado[mapping["ElManito"]].pago += 5);

  const listaFinal = Object.values(acumulado).sort(
    (a, b) => b.puntos - a.puntos,
  );
  let lastPuntos = null;
  let lastPos = 0;
  listaFinal.forEach((j, idx) => {
    if (j.puntos === lastPuntos) j.posicion = lastPos;
    else {
      lastPos = idx + 1;
      lastPuntos = j.puntos;
      j.posicion = lastPos;
    }
  });

  return listaFinal;
};

const resultado = calcularAcumuladoSimple(1, 38);

// Write output file
const out =
  "export const historico25_26 = " + JSON.stringify(resultado, null, 2) + ";\n";
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath);
