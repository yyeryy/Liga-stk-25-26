import React, { useEffect, useState } from "react";
import "./ComidaPanel.css";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";

export const ComidaPanel: React.FC = () => {
  const [pagos, setPagos] = useState<JugadorPago[]>([]);

  useEffect(() => {
    const resultado = calcularAcumulado(1, 38);
    setPagos(resultado);
  }, []);

  const total = pagos.reduce((s, p) => s + (p.pago ?? 0), 0);
  const playersCount = pagos.length;
  const avgPerPerson = playersCount > 0 ? total / playersCount : 0;

  const externalPrice = avgPerPerson;

  const fmt = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(2));

  return (
    <div className="comida-panel">
      <div className="panel panel-screen">
        <h2 className="h2">🍽️ Panel de Comida</h2>
        <p className="subtitle">
          Resumen rápido de importes relacionados con comidas
        </p>

        <div className="comida-grid">
          <div className="app-card comida-card">
            <div className="card-title">Dinero total</div>
            <div className="card-value">{fmt(total)}€</div>
            <div className="card-sub">
              Total acumulado (todos los jugadores)
            </div>
          </div>

          <div className="app-card comida-card">
            <div className="card-title">Media por persona</div>
            <div className="card-value">{fmt(avgPerPerson)}€</div>
            <div className="card-sub">Media entre {playersCount} personas</div>
          </div>

          <div className="app-card comida-card">
            <div className="card-title">Si viene un externo</div>
            <div className="card-value">{fmt(externalPrice)}€</div>
            <div className="card-sub">Asumimos que paga la media</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComidaPanel;
