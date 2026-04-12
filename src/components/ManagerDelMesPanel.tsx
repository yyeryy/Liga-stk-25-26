import { useMemo, useState } from "react";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import "./ManagerDelMesPanel.css";

// Mapeo oficial aproximado de las jornadas de LaLiga por meses
const CALENDARIO_MESES = [
  { id: "agosto", nombre: "Agosto", icono: "☀️", desde: 1, hasta: 4 },
  { id: "septiembre", nombre: "Septiembre", icono: "🎒", desde: 5, hasta: 8 },
  { id: "octubre", nombre: "Octubre", icono: "🍂", desde: 9, hasta: 11 },
  { id: "noviembre", nombre: "Noviembre", icono: "🍄", desde: 12, hasta: 14 },
  { id: "diciembre", nombre: "Diciembre", icono: "🎄", desde: 15, hasta: 18 },
  { id: "enero", nombre: "Enero", icono: "❄️", desde: 19, hasta: 21 },
  { id: "febrero", nombre: "Febrero", icono: "🎭", desde: 22, hasta: 25 },
  { id: "marzo", nombre: "Marzo", icono: "🌱", desde: 26, hasta: 29 },
  { id: "abril", nombre: "Abril", icono: "🌧️", desde: 30, hasta: 33 },
  { id: "mayo", nombre: "Mayo", icono: "🏆", desde: 34, hasta: 38 },
];

export const ManagerDelMesPanel = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState(
    CALENDARIO_MESES[0].id,
  );
  const mesData = useMemo(() => {
    const mesDef = CALENDARIO_MESES.find((m) => m.id === mesSeleccionado);
    if (!mesDef) return null;

    // Verificamos si se ha jugado alguna jornada de este mes
    const jornadasDelMes = data.jornadas.filter(
      (j) =>
        j.numero >= mesDef.desde &&
        j.numero <= mesDef.hasta &&
        j.resultados.some((r) => r.puntos > 0),
    );

    if (jornadasDelMes.length === 0) {
      return { mes: mesDef, jugado: false, ranking: [] };
    }

    // Calculamos el acumulado solo para el rango de ese mes
    const resultadosMes = calcularAcumulado(mesDef.desde, mesDef.hasta);

    // CAMBIO: Ordenamos primero por MENOR PAGO, y en caso de empate, por MAYOR PUNTUACIÓN
    const ranking = [...resultadosMes]
      .filter((j) => j.puntos > 0 || j.pago > 0)
      .sort((a, b) => a.pago - b.pago || b.puntos - a.puntos);

    // Asignamos posiciones reales resolviendo empates exactos (mismo pago y mismos puntos)
    let lastPago: number | null = null;
    let lastPuntos: number | null = null;
    let lastPos = 0;

    ranking.forEach((j, idx) => {
      if (j.pago === lastPago && j.puntos === lastPuntos) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPago = j.pago;
        lastPuntos = j.puntos;
        j.posicion = lastPos;
      }
    });

    return {
      mes: mesDef,
      jugado: true,
      ranking,
      jornadasDisputadas: jornadasDelMes.length,
    };
  }, [mesSeleccionado]);

  const mesDef = CALENDARIO_MESES.find((m) => m.id === mesSeleccionado);

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  return (
    <div className="manager-panel">
      <div className="panel manager-content panel-screen">
        <h2 className="h2">🗓️ Mánager del Mes</h2>
        <p className="text-muted manager-subtitle">
          ¿Quién ha protegido mejor su cartera este mes?
        </p>

        <div className="manager-months">
          {CALENDARIO_MESES.map((mes) => {
            const isSelected = mesSeleccionado === mes.id;
            return (
              <div
                key={mes.id}
                onClick={() => setMesSeleccionado(mes.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMesSeleccionado(mes.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={`manager-month-chip ${isSelected ? "manager-month-chip--active" : ""}`}
              >
                {mes.icono} {mes.nombre}
              </div>
            );
          })}
        </div>

        <div className="manager-header">
          <h5>
            Jornadas {mesDef?.desde} a {mesDef?.hasta}
          </h5>
          {mesData?.jugado && (
            <div className="meta">
              {mesData.jornadasDisputadas} jornadas disputadas
            </div>
          )}
        </div>

        {!mesData?.jugado ? (
          <div className="manager-empty">
            <span className="manager-empty__emoji">⏳</span>
            <h5 className="mt-2 text-muted">Aún no se ha jugado</h5>
            <p className="text-muted">
              Vuelve cuando arranquen las jornadas de este mes.
            </p>
          </div>
        ) : (
          <div className="manager-list">
            {mesData.ranking.length > 0 && (
              <div className="manager-mvp">
                <div>
                  <div className="manager-mvp__label">
                    👑 MVP de {mesDef?.nombre}
                  </div>
                  <div className="manager-mvp__name">
                    {mesData.ranking[0].jugador}
                  </div>
                </div>
                <div className="manager-mvp__actions">
                  <div
                    className={`manager-mvp__price ${mesData.ranking[0].pago > 0 ? "manager-mvp__price--warn" : ""}`}
                  >
                    {formatEuros(mesData.ranking[0].pago)}€
                  </div>
                  <div className="manager-mvp__meta">
                    {mesData.ranking[0].puntos} pts
                  </div>
                </div>
              </div>
            )}

            {mesData.ranking.slice(1).map((j, idx) => {
              const posReales = j.posicion ?? idx + 2;
              return (
                <div key={j.jugador} className="manager-item">
                  <div className="manager-item__left">
                    <div className="manager-rank">
                      {posReales === 2
                        ? "🥈"
                        : posReales === 3
                          ? "🥉"
                          : `${posReales}º`}
                    </div>
                    <div className="manager-player">{j.jugador}</div>
                  </div>

                  <div className="manager-item__right">
                    <div
                      className={`manager-payment ${j.pago > 0 ? "manager-payment--owed" : "manager-payment--ok"}`}
                    >
                      {formatEuros(j.pago)}€
                    </div>
                    <div className="manager-points">{j.puntos} pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
