import React, { useState } from "react";
import "./styles.css";
import { TiposVista } from "./models/models.ts";
import NavBar from "./components/navbar.tsx";
import JugadoresPanel from "./components/jugadores/paginaJuagdores.tsx";

const App: React.FC = () => {
  const [vista, setVista] = useState<TiposVista>(TiposVista.Inicio); // 1 = Inicio, 2 = Jugadores, 3 = Config
  return (
    <div>
      <NavBar onSelect={setVista} />
      <div style={{ paddingTop: "56px" }}>
        {vista === TiposVista.Inicio &&
        <p>Inicio</p>}
                {vista === TiposVista.Jugadores &&
        <JugadoresPanel></JugadoresPanel>}
      </div>
    </div>
  );
};
export default App;
