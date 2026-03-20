import { useState, useEffect } from "react";
import { Apodos } from "../models/models.ts";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";

// NUEVO: Importamos el Modal
import ModalJugador from "./ModalJugador.tsx";

type JornadaJugador = {
  jugador: Apodos;
  puntos: number;
  pago?: number;
  posicion?: number;
};

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState(1);
  const [jornada, setJornada] = useState<JornadaJugador[]>([]);

  // NUEVO: Estados para controlar el modal
  const [modalShow, setModalShow] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Apodos | null>(
    null,
  );

  useEffect(() => {
    setJornada(calcularAcumulado(selectedJornada, selectedJornada));
  }, [selectedJornada]);

  // NUEVO: Función para abrir el modal
  const handleAbrirModal = (jugador: Apodos) => {
    setJugadorSeleccionado(jugador);
    setModalShow(true);
  };

  const getColorByPago = (pago: number) => {
    const colores: Record<number, string> = {
      0: "#e8f5e9", // Verde éxito
      1: "#fff3e0", // Naranja suave
      2: "#ffe0b2",
      3: "#ffccbc",
      4: "#ffab91",
      5: "#f48fb1",
      6: "#ce93d8",
      7: "#ef9a9a",
      8: "#e57373", // Rojo aviso
    };
    return colores[Math.round(pago)] || "#e57373";
  };

  const getMedal = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return null;
  };

  // Definición de anchos para que sumen 100% exacto
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
        overflowX: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          padding: "15px",
        }}
      >
        {/* Header y Selector */}
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
            📅 Jornada {selectedJornada}
          </h2>

          <select
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(Number(e.target.value))}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid #3498db",
              backgroundColor: "white",
              width: "100%",
              maxWidth: "300px",
              fontWeight: "bold",
              outline: "none",
            }}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Jornada {j}
              </option>
            ))}
          </select>
        </div>

        {/* Contenido sin tabla real para evitar scroll */}
        <div style={{ width: "100%" }}>
          {jornada.every((j) => j.puntos === 0) ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#95a5a6" }}
            >
              <img
                src="../imagenes/spinner.jpg"
                style={{
                  width: "60px",
                  borderRadius: "50%",
                  opacity: 0.6,
                  marginBottom: "10px",
                }}
                alt="Cargando"
              />
              <p>Aún no disputada</p>
            </div>
          ) : (
            <>
              {/* Cabecera personalizada */}
              <div
                style={{
                  display: "flex",
                  padding: "0 5px 10px 5px",
                  color: "#7f8c8d",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                <div style={{ width: colWidths.pos, textAlign: "center" }}>
                  Pos
                </div>
                <div style={{ width: colWidths.jugador }}>Jugador</div>
                <div style={{ width: colWidths.puntos, textAlign: "center" }}>
                  Pts
                </div>
                <div style={{ width: colWidths.pago, textAlign: "right" }}>
                  Pago
                </div>
              </div>

              {/* Filas con Flexbox */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {jornada.map((j, idx) => {
                  const bgColor = getColorByPago(j.pago ?? 0);
                  const esPodio = (j.posicion ?? 0) <= 3;

                  return (
                    <div
                      key={idx}
                      // NUEVO: Añadimos onClick y estilo para que sea clicable
                      onClick={() => handleAbrirModal(j.jugador)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: bgColor,
                        borderRadius: "10px",
                        padding: "12px 5px",
                        fontSize: "0.85rem",
                        cursor: "pointer", // Indicador visual
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      } // Efecto hover
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
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
                          fontWeight: esPodio ? "bold" : "normal",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          paddingRight: "5px",
                        }}
                      >
                        {j.jugador}
                      </div>
                      <div
                        style={{
                          width: colWidths.puntos,
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {j.puntos}
                      </div>
                      <div
                        style={{
                          width: colWidths.pago,
                          textAlign: "right",
                          fontWeight: "bold",
                          color: (j.pago ?? 0) > 0 ? "#c0392b" : "#27ae60",
                        }}
                      >
                        {j.pago}€
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
