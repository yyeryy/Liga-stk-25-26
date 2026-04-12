import React, { useState } from "react";
import "./styles.css";
import { TiposVista } from "./models/models.ts";
import NavBar from "./components/navbar.tsx";
import { JornadasPanel } from "./components/jornadas.tsx";
import { PagosPanel } from "./components/pagos.tsx";
import { EstadisticasPanel } from "./components/estadisticas.tsx";
import { RachasPanel } from "./components/RachasPanel.tsx";
import { CaraACaraPanel } from "./components/CaraACara.tsx";
import { PrediccionesPanel } from "./components/PrediccionesPanel.tsx";
import { EvolucionPanel } from "./components/EvolucionPanel.tsx";
import { ManagerDelMesPanel } from "./components/ManagerDelMesPanel.tsx";
import { JugadoresPanel } from "./components/JugadoresPanel.tsx";
import { HistoricoPanel } from "./components/HistoricoPanel.tsx";
import ComidaPanel from "./components/ComidaPanel.tsx";

const App: React.FC = () => {
  const [vista, setVista] = useState<TiposVista>(TiposVista.Pagos);
  return (
    <div>
      <NavBar onSelect={setVista} vistaActual={vista} />
      <main className="container-centered app-main">
        {vista === TiposVista.Jornadas && <JornadasPanel></JornadasPanel>}
        {vista === TiposVista.Pagos && <PagosPanel></PagosPanel>}
        {vista === TiposVista.Comida && <ComidaPanel />}
        {vista === TiposVista.Estadisticas && (
          <EstadisticasPanel></EstadisticasPanel>
        )}
        {vista === TiposVista.Jugadores && <JugadoresPanel />}
        {vista === TiposVista.Rachas && <RachasPanel />}
        {vista === TiposVista.CaraACara && <CaraACaraPanel />}
        {vista === TiposVista.Predicciones && <PrediccionesPanel />}
        {vista === TiposVista.ManagerMes && <ManagerDelMesPanel />}
        {vista === TiposVista.Evolucion && <EvolucionPanel />}
        {vista === TiposVista.Historico && <HistoricoPanel />}
      </main>
    </div>
  );
};
export default App;
