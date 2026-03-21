import { useMemo, useState } from "react";
import { data } from "../data/data.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

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
            marginBottom: "5px",
            fontSize: "1.5rem",
          }}
        >
          🗓️ Mánager del Mes
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "0.85rem",
            marginBottom: "20px",
          }}
        >
          ¿Quién ha protegido mejor su cartera este mes?
        </p>

        {/* SELECTOR DE MESES (Scroll horizontal suave en móvil) */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "10px",
            paddingBottom: "15px",
            marginBottom: "15px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {CALENDARIO_MESES.map((mes) => {
            const isSelected = mesSeleccionado === mes.id;
            return (
              <div
                key={mes.id}
                onClick={() => setMesSeleccionado(mes.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: isSelected ? "#3498db" : "#f8f9fa",
                  color: isSelected ? "white" : "#7f8c8d",
                  fontWeight: isSelected ? "bold" : "600",
                  border: `1px solid ${isSelected ? "#2980b9" : "#eee"}`,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected
                    ? "0 4px 10px rgba(52, 152, 219, 0.2)"
                    : "none",
                }}
              >
                {mes.icono} {mes.nombre}
              </div>
            );
          })}
        </div>

        {/* CABECERA DEL MES SELECCIONADO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            border: "1px dashed #dee2e6",
          }}
        >
          <h5 style={{ margin: 0, color: "#2c3e50", fontWeight: "bold" }}>
            Jornadas {mesDef?.desde} a {mesDef?.hasta}
          </h5>
          {mesData?.jugado && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "#27ae60",
                fontWeight: "600",
              }}
            >
              {mesData.jornadasDisputadas} jornadas disputadas
            </span>
          )}
        </div>

        {/* CONTENIDO DEL RANKING */}
        {!mesData?.jugado ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#fffcf0",
              borderRadius: "12px",
              border: "1px dashed #fde08b",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>⏳</span>
            <h5 className="mt-2 text-muted" style={{ color: "#b8860b" }}>
              Aún no se ha jugado
            </h5>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              Vuelve cuando arranquen las jornadas de este mes.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* MVP DEL MES (Tarjeta Especial) */}
            {mesData.ranking.length > 0 && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                  borderRadius: "15px",
                  padding: "20px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 20px rgba(253, 160, 133, 0.4)",
                  cursor: "pointer",
                  marginBottom: "10px",
                  transform: "scale(1.02)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      fontWeight: "900",
                      letterSpacing: "1px",
                      opacity: 0.9,
                    }}
                  >
                    👑 MVP de {mesDef?.nombre}
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "black",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {mesData.ranking[0].jugador}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "black",
                      lineHeight: 1,
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                      color: mesData.ranking[0].pago === 0 ? "#fff" : "#ffeaa7",
                    }}
                  >
                    {formatEuros(mesData.ranking[0].pago)}€
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      opacity: 0.9,
                      marginTop: "2px",
                    }}
                  >
                    {mesData.ranking[0].puntos} pts
                  </div>
                </div>
              </div>
            )}

            {/* RESTO DE JUGADORES */}
            {mesData.ranking.slice(1).map((j, idx) => {
              const posReales = j.posicion ?? idx + 2;
              return (
                <div
                  key={j.jugador}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "12px 15px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateX(5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateX(0)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "25px",
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#7f8c8d",
                      }}
                    >
                      {posReales === 2
                        ? "🥈"
                        : posReales === 3
                          ? "🥉"
                          : `${posReales}º`}
                    </div>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#2c3e50",
                        fontSize: "1.05rem",
                      }}
                    >
                      {j.jugador}
                    </div>
                  </div>

                  {/* Deuda destacada a la derecha */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "900",
                        color: j.pago > 0 ? "#e74c3c" : "#27ae60",
                        fontSize: "1.2rem",
                        lineHeight: "1",
                      }}
                    >
                      {formatEuros(j.pago)}€
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#95a5a6",
                        fontWeight: "600",
                        marginTop: "2px",
                      }}
                    >
                      {j.puntos} pts
                    </div>
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
