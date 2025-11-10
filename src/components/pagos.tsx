import { useState, useEffect, useMemo } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";

export const PagosPanel = () => {
  const [selectedBloque, setSelectedBloque] = useState(0);
  const [pagos, setPagos] = useState<JugadorPago[]>([]);

  const bloques = useMemo(
    () => [
      { id: 0, nombre: "General", desde: 1, hasta: 38 },
      { id: 1, nombre: "Jornadas 1-5", desde: 1, hasta: 5 },
      { id: 2, nombre: "Jornadas 6-10", desde: 6, hasta: 10 },
      { id: 3, nombre: "Jornadas 11-15", desde: 11, hasta: 15 },
      { id: 4, nombre: "Jornadas 16-20", desde: 16, hasta: 20 },
      { id: 5, nombre: "Jornadas 21-25", desde: 21, hasta: 25 },
      { id: 6, nombre: "Jornadas 26-30", desde: 26, hasta: 30 },
      { id: 7, nombre: "Jornadas 31-35", desde: 31, hasta: 35 },
      { id: 8, nombre: "Jornadas 36-38", desde: 36, hasta: 38 },
      // ... el resto
    ],
    [] // solo se inicializa una vez
  );

  // Gradiente verde muy suave -> rojo claro (sin amarillo intermedio)
  // Gradiente verde pastel -> rojo pastel un poco más fuerte
  const getColorByPago = (pago: number, maxPago: number) => {
    if (maxPago === 0) return "#e6ffe6"; // verde muy clarito por defecto

    const ratio = Math.min(1, pago / maxPago); // 0..1

    // colores extremos
    const start = { r: 230, g: 255, b: 230 }; // #e6ffe6 (verde pastel)
    const end = { r: 255, g: 128, b: 128 }; // #ff8080 (rojo pastel más fuerte)

    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);

    return `rgb(${r},${g},${b})`;
  };

  useEffect(() => {
    const bloque = bloques.find((b) => b.id === selectedBloque);
    if (!bloque) return;

    // Calcular acumulado
    const resultado = calcularAcumulado(bloque.desde, bloque.hasta);

    // Ordenar por pago descendente
    const resultadoOrdenado = [...resultado].sort((a, b) => a.pago - b.pago);

    // Asignar posiciones según pago
    let lastPago: number | null = null;
    let lastPos = 0;
    resultadoOrdenado.forEach((j, idx) => {
      if (j.pago === lastPago) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPago = j.pago;
        j.posicion = lastPos;
      }
    });

    setPagos(resultadoOrdenado);
  }, [selectedBloque, bloques]);

  return (
    <div className="panelContainer">
      <div className="card">
        <h2 className="title">
          Pagos - {bloques.find((b) => b.id === selectedBloque)?.nombre}
        </h2>
        <div className="selectWrapper">
          <select
            value={selectedBloque}
            onChange={(e) => setSelectedBloque(Number(e.target.value))}
          >
            {bloques.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="tableWrapper">
          {pagos.every((p) => p.puntos === 0) ? (
            <div className="spinnerWrapper">
              <img
                src="../imagenes/spinner.jpg"
                alt=""
                className="rotatingImage"
              />
              <p>Pagos aún no registrados</p>
            </div>
          ) : (
            <>
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
                  {pagos.map((j, idx) => (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: getColorByPago(
                          j.pago ?? 0,
                          Math.max(...pagos.map((p) => p.pago))
                        ),
                      }}
                    >
                      <td
                        style={{
                          backgroundColor: getColorByPago(
                            j.pago ?? 0,
                            Math.max(...pagos.map((p) => p.pago))
                          ),
                        }}
                      >
                        {j.posicion}
                      </td>
                      <td
                        style={{
                          backgroundColor: getColorByPago(
                            j.pago ?? 0,
                            Math.max(...pagos.map((p) => p.pago))
                          ),
                        }}
                      >
                        {j.jugador}
                      </td>
                      <td
                        style={{
                          backgroundColor: getColorByPago(
                            j.pago ?? 0,
                            Math.max(...pagos.map((p) => p.pago))
                          ),
                        }}
                      >
                        {j.puntos}
                      </td>
                      <td
                        style={{
                          backgroundColor: getColorByPago(
                            j.pago ?? 0,
                            Math.max(...pagos.map((p) => p.pago))
                          ),
                        }}
                      >
                        {j.pago} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedBloque === 0 && (
                <div className="zarrakatzSection">
                  <p>* Zarrakatz debe: 14€</p>
                  <p>* Polfovich debe: 19€</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
