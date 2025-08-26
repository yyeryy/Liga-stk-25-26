import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "liga.json");

app.use(cors());
app.use(express.json());

// Crear archivo inicial si no existe
const initData = async () => {
  const exists = await fs.pathExists(DATA_FILE);
  if (!exists) {
    await fs.writeJson(DATA_FILE, {
      jugadores: [
        { id: 1, nombre: "Yeray", equipo: "STK A", puntos: 15, descripcion: "Delantero estrella", imagen: "" },
        { id: 2, nombre: "Ana", equipo: "STK B", puntos: 20, descripcion: "Centrocampista rápido", imagen: "" },
      ],
    }, { spaces: 2 });
  }
};
initData();

app.get("/liga", async (req, res) => {
  const data = await fs.readJson(DATA_FILE);
  res.json(data);
});

app.post("/liga", async (req, res) => {
  await fs.writeJson(DATA_FILE, req.body, { spaces: 2 });
  res.json({ message: "Datos guardados correctamente" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
