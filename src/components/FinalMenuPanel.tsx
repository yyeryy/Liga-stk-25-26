import { useMemo, useState } from "react";
import { calcularAcumulado } from "../utils/calcularAcumulado.ts";
import { Apodos } from "../models/models.ts";
import "./FinalMenuPanel.css";

const normalizeName = (jugador: string) =>
  jugador
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

const getPhotoSrc = (jugador: Apodos, ext = "png") =>
  `../imagenes/${normalizeName(String(jugador))}.${ext}`;

const formatPosition = (posicion: number) => {
  if (posicion === 1) return "1";
  if (posicion === 2) return "2";
  if (posicion === 3) return "3";
  return String(posicion);
};

export const FinalMenuPanel = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const rankingGeneral = useMemo(() => {
    const resultado = calcularAcumulado(1, 38);
    const ordenado = [...resultado].sort(
      (a, b) => a.pago - b.pago || b.puntos - a.puntos,
    );

    let lastPago: number | null = null;
    let lastPos = 0;

    ordenado.forEach((j, idx) => {
      if (j.pago === lastPago) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPago = j.pago;
        j.posicion = lastPos;
      }
    });

    return ordenado;
  }, []);

  const [campeon, subcampeon, tercero, ...resto] = rankingGeneral;

  return (
    <section className="final-menu-panel panel-screen">
      <div className="final-hero">
        <p className="final-kicker">Clasificación final</p>
        <h1 className="final-title">El podio de la Liga STK</h1>
        <p className="final-subtitle">
          Cierre oficial con la clasificación general de Pagos.
        </p>

        <div className="podium-layout" aria-label="Podio final">
          {subcampeon && (
            <article className="podium-card podium-card--silver">
              <div className="podium-rank">2</div>
              <div className="podium-avatar">
                <img
                  src={getPhotoSrc(subcampeon.jugador, "png")}
                  alt={subcampeon.jugador}
                  className="clickable"
                  onClick={() => setSelectedImage(String(subcampeon.jugador))}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.endsWith(".png"))
                      img.src = getPhotoSrc(subcampeon.jugador, "jpg");
                    else img.src = "../imagenes/spinner.jpg";
                  }}
                />
              </div>
              <div className="podium-name">{subcampeon.jugador}</div>
              <div className="podium-label">Subcampeón</div>
            </article>
          )}

          {campeon && (
            <article className="podium-card podium-card--gold">
              <div className="podium-rank podium-rank--hero">1</div>
              <div className="podium-avatar podium-avatar--hero">
                <img
                  src={getPhotoSrc(campeon.jugador, "png")}
                  alt={campeon.jugador}
                  className="clickable"
                  onClick={() => setSelectedImage(String(campeon.jugador))}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.endsWith(".png"))
                      img.src = getPhotoSrc(campeon.jugador, "jpg");
                    else img.src = "../imagenes/spinner.jpg";
                  }}
                />
              </div>
              <div className="podium-name podium-name--gold">
                {campeon.jugador}
              </div>
              <div className="podium-label">Ganador</div>
            </article>
          )}

          {tercero && (
            <article className="podium-card podium-card--bronze">
              <div className="podium-rank">3</div>
              <div className="podium-avatar">
                <img
                  src={getPhotoSrc(tercero.jugador, "png")}
                  alt={tercero.jugador}
                  className="clickable"
                  onClick={() => setSelectedImage(String(tercero.jugador))}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.endsWith(".png"))
                      img.src = getPhotoSrc(tercero.jugador, "jpg");
                    else img.src = "../imagenes/spinner.jpg";
                  }}
                />
              </div>
              <div className="podium-name">{tercero.jugador}</div>
              <div className="podium-label">Tercer puesto</div>
            </article>
          )}
        </div>
      </div>

      <div className="final-list-shell">
        <div className="final-list-header">
          <div className="final-list-pos">Pos</div>
          <div className="final-list-player">Jugador</div>
        </div>

        <div className="final-list">
          {resto.map((jugador) => (
            <div key={jugador.jugador} className="final-list-row">
              <div className="final-list-pos final-list-pos--badge">
                {formatPosition(jugador.posicion)}
              </div>
              <div className="final-list-player final-list-player--with-photo">
                <img
                  className="final-list-photo clickable"
                  src={getPhotoSrc(jugador.jugador, "png")}
                  alt={jugador.jugador}
                  onClick={() => setSelectedImage(String(jugador.jugador))}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.endsWith(".png"))
                      img.src = getPhotoSrc(jugador.jugador, "jpg");
                    else img.src = "../imagenes/spinner.jpg";
                  }}
                />
                <span>{jugador.jugador}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mención honorífica a los participantes temporales */}
      <div className="final-honor">
        <h3 className="final-honor-title">Mención honorífica</h3>
        <p className="final-honor-sub">
          Agradecimiento a los que estuvieron temporalmente en la liga
        </p>
        <div className="final-honor-list">
          {["Zarrakatz" as Apodos, "Polfovich" as Apodos].map((j) => (
            <div key={j} className="final-honor-card">
              <img
                src={getPhotoSrc(j, "png")}
                alt={String(j)}
                className="final-honor-photo clickable"
                onClick={() => setSelectedImage(String(j))}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src.endsWith(".png")) img.src = getPhotoSrc(j, "jpg");
                  else img.src = "../imagenes/spinner.jpg";
                }}
              />
              <div className="final-honor-name">{j}</div>
              <div className="final-honor-note">
                Participó temporalmente — gracias
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para ver imagen ampliada */}
      {selectedImage && (
        <div
          className="final-image-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="final-image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getPhotoSrc(selectedImage as Apodos, "png")}
              alt={selectedImage}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.endsWith(".png"))
                  img.src = getPhotoSrc(selectedImage as Apodos, "jpg");
                else img.src = "../imagenes/spinner.jpg";
              }}
            />
            <button
              className="final-image-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
