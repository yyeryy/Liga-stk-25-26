import React, { useState, useEffect } from 'react';
import { useJornada } from '../hooks/obtenerJornada.tsx';

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState(1);
  const { jornada: jornadaOriginal, loading } = useJornada(selectedJornada);

  const [jornada, setJornada] = useState(
    [] as { jugador: string; puntos: number; pago: number; posicion: number }[]
  );

  // Inicializamos la jornada editable cuando cambie la original
  useEffect(() => {
    setJornada(jornadaOriginal);
  }, [jornadaOriginal]);

  // Maneja el cambio de puntos en la tabla
  const handleChangePuntos = (idx: number, value: number) => {
    const updated = [...jornada];
    updated[idx].puntos = value;
    setJornada(updated);
  };

  // Función para calcular posiciones
  const calcularPosiciones = (lista: typeof jornada) => {
    const ordenada = [...lista].sort((a, b) => b.puntos - a.puntos);
    let lastPuntos = 0;
    let lastPosicion = 0;

    return ordenada.map((j, idx) => {
      if (j.puntos === lastPuntos) {
        return { ...j, posicion: lastPosicion };
      } else {
        lastPosicion = idx + 1;
        lastPuntos = j.puntos;
        return { ...j, posicion: lastPosicion };
      }
    });
  };

  const handleGuardar = () => {
    const jornadaConPosiciones = calcularPosiciones(jornada);
    setJornada(jornadaConPosiciones);
    console.log('Datos guardados:', jornadaConPosiciones);
    alert('Datos guardados en consola. Aquí puedes enviar a tu backend.');
  };

  return (
    <div className="flex justify-start p-6">
      <div className="w-1/2 bg-white rounded-2xl shadow-lg p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Jornada {selectedJornada}
        </h2>

        <div className="mb-4 flex justify-center">
          <select
            value={selectedJornada}
            onChange={(e) => setSelectedJornada(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Jornada {j}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Posición</th>
                    <th className="border border-gray-300 px-4 py-2">Jugador</th>
                    <th className="border border-gray-300 px-4 py-2">Puntos</th>
                    <th className="border border-gray-300 px-4 py-2">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {jornada.map((j, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {j.posicion}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{j.jugador}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="number"
                          value={j.puntos}
                          onBlur={(e) =>
                            handleChangePuntos(idx, Number(e.target.value))
                          }
                          className="w-16 text-center border rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {j.pago}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleGuardar}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
