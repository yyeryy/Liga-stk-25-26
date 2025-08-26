import React, { useState, useEffect } from "react";
import { useJornada } from "../hooks/obtenerJornada.tsx";
import { supabase } from "../supabase";

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState(1);
  const [jornadaTerminada, setJornadaTerminada] = useState(1);

  const { jornada: jornadaOriginal, loading } = useJornada(selectedJornada);
  const [jornada, setJornada] = useState<
    {
      jugador: string;
      puntos: number;
      pago: number;
      posicion: number;
      idJugador: number;
    }[]
  >([]);

  const pagosPorPosicion: Record<number, number> = {
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

  useEffect(() => {
    if (jornadaOriginal?.length) {
      setJornada(
        jornadaOriginal.map((j) => ({
          ...j,
          jugador: j.jugador,
        }))
      );
    }
  }, [jornadaOriginal]);

  useEffect(() => {
    const jornadaAcabada = async () => {
      const { data, error } = await supabase
        .from("cfgJornadasAcabadas")
        .select("*")
        .eq("idJornada", selectedJornada)
        .single();

      if (error) {
        console.error("Error cargando la jornada:", error);
        return;
      }

      if (data) {
        setJornadaTerminada(data.acabada);
      }
    };

    jornadaAcabada();
  }, [selectedJornada]);

  const calcularPosiciones = (
    lista: { jugador: string; puntos: number; idJugador: number }[]
  ) => {
    const ordenada = [...lista].sort((a, b) => b.puntos - a.puntos);
    let lastPuntos: number | null = null;
    let lastPosicion = 0;

    const conPosiciones = ordenada.map((j, idx) => {
      if (j.puntos === lastPuntos) return { ...j, posicion: lastPosicion };
      lastPosicion = idx + 1;
      lastPuntos = j.puntos;
      return { ...j, posicion: lastPosicion };
    });

    return conPosiciones.map((jugador) => {
      const empatados = conPosiciones.filter(
        (j) => j.puntos === jugador.puntos
      );
      if (empatados.length > 1) {
        const sumPagos = empatados.reduce(
          (acc, j) => acc + (pagosPorPosicion[j.posicion] || 0),
          0
        );
        return { ...jugador, pago: sumPagos / empatados.length };
      }
      return { ...jugador, pago: pagosPorPosicion[jugador.posicion] || 0 };
    });
  };

  const handleChangePuntos = (idx: number, value: number) => {
    const updated = [...jornada];
    updated[idx].puntos = value;
    setJornada(updated);
  };

  const handleGuardar = async () => {
    const jornadaConPosiciones = calcularPosiciones(jornada);
    setJornada(jornadaConPosiciones);

    try {
      await supabase
        .from("jornadas")
        .delete()
        .eq("numeroJornada", selectedJornada);

      const { error } = await supabase.from("jornadas").insert(
        jornadaConPosiciones.map((j) => ({
          numeroJornada: selectedJornada,
          idJugador: j.idJugador,
          puntos: j.puntos,
          pago: j.pago,
          posicion: j.posicion,
        }))
      );

      if (error) throw error;

      alert("Jornada guardada correctamente en BBDD ✅");
    } catch (err) {
      console.error(err);
      alert("Error al guardar en BBDD ❌");
    }
  };

  return (
    <div className="panelContainer">
      <div className="card">
        <h2 className="title">Jornada {selectedJornada}</h2>
        <div className="selectWrapper">
          <select
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(Number(e.target.value))}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Jornada {j}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="loading">Cargando...</p>
        ) : (
          <>
            <div className="tableWrapper">
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
                  {jornada.map((j, idx) => {
                    let backgroundColor = "";
                    if (j.pago === 0) backgroundColor = "transparent";
                    else if (j.pago === 1)
                      backgroundColor = "#ffcccc"; // rojo clarito
                    else if (j.pago === 2) backgroundColor = "#ff9999";
                    else if (j.pago === 3) backgroundColor = "#ff6666";
                    else if (j.pago === 4) backgroundColor = "#ff3333";
                    else backgroundColor = "#cc0000"; // pagos grandes

                    return (
                      <tr key={idx} style={{ backgroundColor }}>
                        <td>{j.posicion}</td>
                        <td>{j.jugador}</td>
                        {jornadaTerminada ? (
                          <td>{j.puntos}</td>
                        ) : (
                          <td>
                            <input
                              type="number"
                              value={j.puntos}
                              onChange={(e) =>
                                handleChangePuntos(idx, Number(e.target.value))
                              }
                              className="input"
                            />
                          </td>
                        )}
                        <td>{j.pago} €</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!jornadaTerminada && (
              <div className="btnWrapperRight">
                <button onClick={handleGuardar} className="btnGreen">
                  Guardar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
