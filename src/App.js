import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const [jugadores, setJugadores] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");

  // Cargar jugadores
  const fetchJugadores = async () => {
    const { data, error } = await supabase
      .from("jugadores")
      .select("*")
      .order("id", { ascending: true });
  
    if (error) console.error(error);
    else setJugadores(data);
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  // Actualizar jugador
  const updateJugador = async (id, field, value) => {
    await supabase.from("jugadores").update({ [field]: value }).eq("id", id);
    fetchJugadores();
  };

  // Añadir nuevo jugador
  const addJugador = async () => {
    if (!nuevoNombre) return;
    await supabase.from("jugadores").insert([{ nombre: nuevoNombre}]);
    setNuevoNombre("");
    fetchJugadores();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Mi Liga Biwenger</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Nuevo jugador"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <button onClick={addJugador} style={{ marginLeft: "0.5rem" }}>Añadir</button>
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puntos</th>
            <th>Pagos (€)</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((j) => (
            <tr key={j.id}>
              <td>
                <input
                  value={j.nombre}
                  onChange={(e) => updateJugador(j.id, "nombre", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={j.puntos}
                  onChange={(e) => updateJugador(j.id, "puntos", Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={j.pagos}
                  onChange={(e) => updateJugador(j.id, "pagos", Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
