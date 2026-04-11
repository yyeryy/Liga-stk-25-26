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
  const payers = pagos.filter((p) => (p.pago ?? 0) > 0);
  const payersCount = payers.length;
  const avgPerPerson = playersCount > 0 ? total / playersCount : 0;
  const externalPrice = avgPerPerson;
  const externalWithTip = externalPrice * 1.1;

  const sorted = [...pagos].map((p) => p.pago ?? 0).sort((a, b) => a - b);
  const median = (() => {
    if (sorted.length === 0) return 0;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  })();

  const maxPaid = sorted.length ? Math.max(...sorted) : 0;
  const minPaidNonZeroArr = sorted.filter((v) => v > 0);
  const minPaidNonZero = minPaidNonZeroArr.length
    ? Math.min(...minPaidNonZeroArr)
    : 0;

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
