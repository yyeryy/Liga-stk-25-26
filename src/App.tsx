import React, { useState } from "react";
import "./styles.css";
import { TiposVista } from "./models/models.ts";
import NavBar from "./components/navbar.tsx";
import JugadoresPanel from "./components/jugadores/paginaJuagdores.tsx";
import { JornadasPanel } from "./components/jornadas.tsx";
import { PagosPanel } from "./components/pagos.tsx";

const App: React.FC = () => {
  const [vista, setVista] = useState<TiposVista>(TiposVista.Jornadas);
  return (
    <div>
      <NavBar onSelect={setVista} />
      <div style={{ paddingTop: "56px" }}>
        {vista === TiposVista.Jornadas && <JornadasPanel></JornadasPanel>}
        {vista === TiposVista.Jugadores && <JugadoresPanel></JugadoresPanel>}
        {vista === TiposVista.Pagos && <PagosPanel></PagosPanel>}
      </div>
    </div>
  );
};
export default App;
