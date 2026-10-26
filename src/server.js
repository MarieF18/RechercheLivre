require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const port = Number(process.env.PORT) || 3000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/recherche_livres";

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`API de recherche de livres disponible sur le port ${port}.`);
  });
}

start().catch((error) => {
  console.error("Impossible de démarrer l’API :", error);
  process.exitCode = 1;
});
