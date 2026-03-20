import { useState, useEffect, useMemo } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";
import { Apodos } from "../models/models.ts"; // NUEVO: Importamos Apodos para el estado del jugador

// NUEVO: Importamos el Modal
import ModalJugador from "./ModalJugador.tsx";

export const PagosPanel = () => {
  const [selectedBloque, setSelectedBloque] = useState(0);
  const [pagos, setPagos] = useState<JugadorPago[]>([]);

  // NUEVO: Estados para controlar el modal
  const [modalShow, setModalShow] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Apodos | null>(
    null,
  );

  const bloques = useMemo(
    () => [
      { id: 0, nombre: "General (Total)", desde: 1, hasta: 38 },
      { id: 1, nombre: "Jornadas 1-5", desde: 1, hasta: 5 },
      { id: 2, nombre: "Jornadas 6-10", desde: 6, hasta: 10 },
      { id: 3, nombre: "Jornadas 11-15", desde: 11, hasta: 15 },
      { id: 4, nombre: "Jornadas 16-20", desde: 16, hasta: 20 },
      { id: 5, nombre: "Jornadas 21-25", desde: 21, hasta: 25 },
      { id: 6, nombre: "Jornadas 26-30", desde: 26, hasta: 30 },
      { id: 7, nombre: "Jornadas 31-35", desde: 31, hasta: 35 },
      { id: 8, nombre: "Jornadas 36-38", desde: 36, hasta: 38 },
    ],
    [],
  );

  const getColorByPago = (pago: number, maxPago: number) => {
    if (maxPago === 0 || pago === 0) return "#e8f5e9";
    const ratio = Math.min(1, pago / maxPago);
    const start = { r: 232, g: 245, b: 233 };
    const end = { r: 255, g: 205, b: 210 };
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    return `rgb(${r},${g},${b})`;
  };

  const getMedal = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return null;
  };

  useEffect(() => {
    const bloque = bloques.find((b) => b.id === selectedBloque);
    if (!bloque) return;
    const resultado = calcularAcumulado(bloque.desde, bloque.hasta);
    const resultadoOrdenado = [...resultado].sort((a, b) => a.pago - b.pago);

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

  // NUEVO: Función para abrir el modal
  const handleAbrirModal = (jugador: Apodos) => {
    setJugadorSeleccionado(jugador);
    setModalShow(true);
  };

  const maxPagoActual = Math.max(...pagos.map((p) => p.pago), 0);

  // Definimos anchos fijos en % para asegurar que NO haya scroll
  const colWidths = {
    pos: "15%",
    jugador: "45%",
    puntos: "20%",
    pago: "20%",
  };

  return (
    <div
      style={{
        padding: "10px",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden", // Prohibido el scroll horizontal en el contenedor
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          padding: "15px",
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Selector ajustado al ancho */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#2c3e50",
              fontSize: "1.3rem",
              textAlign: "center",
            }}
          >
            💸 Pagos
          </h2>
          <select
            value={selectedBloque}
            onChange={(e) => setSelectedBloque(Number(e.target.value))}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "2px solid #6c5ce7",
              width: "100%", // Ocupa todo el ancho disponible
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#6c5ce7",
            }}
          >
            {bloques.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Cabecera Manual (Flexbox) */}
        <div
          style={{
            display: "flex",
            padding: "0 5px 10px 5px",
            color: "#b2bec3",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          <div style={{ width: colWidths.pos, textAlign: "center" }}>Pos</div>
          <div style={{ width: colWidths.jugador }}>Jugador</div>
          <div style={{ width: colWidths.puntos, textAlign: "center" }}>
            Pts
          </div>
          <div style={{ width: colWidths.pago, textAlign: "right" }}>Pago</div>
        </div>

        {/* Filas Flexbox */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {pagos.map((j, idx) => {
            const rowColor = getColorByPago(j.pago ?? 0, maxPagoActual);
            return (
              <div
                key={idx}
                // NUEVO: Añadimos onClick y estilo de cursor para hacer la fila clicable
                onClick={() => handleAbrirModal(j.jugador)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: rowColor,
                  borderRadius: "8px",
                  padding: "10px 5px",
                  fontSize: "0.85rem",
                  cursor: "pointer", // Indicador visual de que es clicable
                  transition: "opacity 0.2s ease", // Transición suave
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")} // Efecto hover
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div
                  style={{
                    width: colWidths.pos,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {getMedal(j.posicion ?? 0) || j.posicion}
                </div>
                <div
                  style={{
                    width: colWidths.jugador,
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis", // Si el nombre es muy largo, pone "..."
                    paddingRight: "5px",
                  }}
                >
                  {j.jugador}
                </div>
                <div style={{ width: colWidths.puntos, textAlign: "center" }}>
                  {j.puntos}
                </div>
                <div
                  style={{
                    width: colWidths.pago,
                    textAlign: "right",
                    fontWeight: "bold",
                    color: (j.pago ?? 0) > 0 ? "#d63031" : "#27ae60",
                  }}
                >
                  {j.pago}€
                </div>
              </div>
            );
          })}
        </div>

        {/* Notas Extraordinarias ajustadas */}
        {selectedBloque === 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#fff5f5",
              borderRadius: "10px",
              fontSize: "0.8rem",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                color: "#d63031",
                marginBottom: "5px",
              }}
            >
              ⚠️ Pendientes:
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Zarrakatz: 14€</span>
              <span>Polfovich: 19€</span>
            </div>
          </div>
        )}
      </div>

      {/* NUEVO: El modal esperando a ser abierto */}
      <ModalJugador
        show={modalShow}
        onHide={() => setModalShow(false)}
        jugador={jugadorSeleccionado}
      />
    </div>
  );
};
