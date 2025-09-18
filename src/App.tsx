import React, { useState } from "react";
import "./styles.css";
import { TiposVista } from "./models/models.ts";
import NavBar from "./components/navbar.tsx";
import { JornadasPanel } from "./components/jornadas.tsx";
import { PagosPanel } from "./components/pagos.tsx";
import { EstadisticasPanel } from "./components/estadisticas.tsx";

const App: React.FC = () => {
  const [vista, setVista] = useState<TiposVista>(TiposVista.Pagos);
  return (
    <div>
      <NavBar onSelect={setVista} />
      <div style={{ paddingTop: "56px" }}>
        {vista === TiposVista.Jornadas && <JornadasPanel></JornadasPanel>}
        {vista === TiposVista.Pagos && <PagosPanel></PagosPanel>}
        {vista === TiposVista.Estadisticas && (
          <EstadisticasPanel></EstadisticasPanel>
        )}
      </div>
    </div>
  );
};
export default App;
