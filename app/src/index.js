import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import os from "os";
import process from "process";

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0"; // garante bind externo no container
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/curso";

// Logs úteis
console.log("[BOOT] NODE_ENV=%s, PORT=%s, MONGODB_URI=%s", process.env.NODE_ENV, port, uri);

// Tolerante a falhas: tenta conectar, mas não derruba o servidor se falhar
(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log("[MONGO] Conectado com sucesso.");
  } catch (err) {
    console.error("[MONGO] Falha ao conectar:", err?.message || err);
  }
})();

// Endpoint de diagnóstico completo
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    node: process.version,
    pid: process.pid,
    platform: os.platform(),
    arch: os.arch(),
    uptime: process.uptime(),
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
    },
    mongoReady: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  });
});

// Rota raiz simples (ajuda a testar no navegador)
app.get("/", (_req, res) => {
  res.send(`<html><body>
    <h1>API do aluno</h1>
    <p>Status em <a href="/health">/health</a></p>
  </body></html>`);
});

// Handlers globais para não derrubar o processo
process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED REJECTION]", err);
});
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
});

app.listen(port, host, () => {
  console.log(`[BOOT] Servidor ouvindo em http://${host}:${port}`);
});
