require("dotenv").config();
const packageInfo = require("./package.json");
const express = require("express");
const http = require("http");
const config = require("./config/app.config");
const logger = require("./src/logger");
const cors = require("cors");
const boom = require("express-boom");

const routes = require("./src/routes");

const app = express();
const server = http.createServer(app);

// @Database Connection
require("./config/database.config");

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

const API_KEY = process.env.API_KEY || "cj_sk_2024_x7k9m2p4q5r6s8t9";
const PRINT_SERVICE_TOKEN =
  process.env.PRINT_SERVICE_TOKEN || "cj_print_2024_s3cur3t0k3n";
const PRINT_MODE = process.env.PRINT_MODE || "local"; // "local" o "cloud"

// Dominios permitidos para CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:8100",
  "http://127.0.0.1:8100",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origen: ${origin}`);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-API-Key", "Authorization"],
};

const validateApiKey = (req, res, next) => {
  if (req.path === "/health" || req.path === "/") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      error: "API Key no proporcionada",
      message: "Se requiere el header X-API-Key",
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(401).json({
      error: "API Key inválida",
      message: "Las credenciales proporcionadas no son válidas",
    });
  }

  next();
};

// ============================================
// SOCKET.IO (solo si PRINT_MODE=cloud)
// ============================================

let io = null;
const printServices = new Map(); // Almacena conexiones de servicios de impresión por store

if (PRINT_MODE === "cloud") {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*", // Los print services pueden conectar desde cualquier IP local
      methods: ["GET", "POST"],
    },
  });

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const store = socket.handshake.auth.store;

    if (token !== PRINT_SERVICE_TOKEN) {
      console.log(`❌ Print Service rechazado - Token inválido`);
      return next(new Error("Token inválido"));
    }

    if (!store || !["BOGOTA", "HELGUERA"].includes(store)) {
      console.log(`❌ Print Service rechazado - Store inválido: ${store}`);
      return next(new Error("Store inválido"));
    }

    socket.store = store;
    next();
  });

  io.on("connection", (socket) => {
    const store = socket.store;

    // Registrar servicio de impresión
    printServices.set(store, socket.id);
    socket.join(store);

    console.log(`🖨️ Print Service conectado: ${store} (${socket.id})`);

    // Manejar resultado de impresión
    socket.on("print_result", (data) => {
      console.log(`📄 Print result de ${store}:`, data);
      // Emitir el resultado para que el controlador lo reciba
      io.emit(`print_result_${data.jobId}`, data);
    });

    socket.on("disconnect", () => {
      printServices.delete(store);
      console.log(`🔌 Print Service desconectado: ${store}`);
    });
  });

  console.log("☁️ PRINT_MODE=cloud - Socket.io habilitado");
} else {
  console.log("🖨️ PRINT_MODE=local - Impresión directa");
}

// Exportar io y printServices para usar en controladores
app.set("io", io);
app.set("printServices", printServices);
app.set("PRINT_MODE", PRINT_MODE);

// ============================================
// MIDDLEWARES
// ============================================

app.use(express.json());
app.use(cors(corsOptions));
app.use(boom());
app.use(validateApiKey);

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (req, res) => {
  const connectedServices = [];
  if (PRINT_MODE === "cloud") {
    printServices.forEach((socketId, store) => {
      connectedServices.push(store);
    });
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: packageInfo.name,
    version: packageInfo.version,
    printMode: PRINT_MODE,
    connectedPrintServices: connectedServices,
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Sales Point API",
    version: packageInfo.version,
    health: "/health",
  });
});

// ============================================
// RUTAS DE LA API
// ============================================

app.use("/", routes);

// ============================================
// INICIAR SERVIDOR
// ============================================

if (config.local) {
  const port = process.env.PORT || config.local.port;
  server.listen(port, () => {
    logger.info(`Application ${packageInfo.name} started at port ${port}`, {
      type: "application_start",
      applicationName: packageInfo.name,
      version: packageInfo.version,
      port,
    });
    console.log(`🔒 CORS habilitado para: ${allowedOrigins.join(", ")}`);
    console.log(`🔑 API Key configurada: ${API_KEY.substring(0, 10)}...`);
    if (PRINT_MODE === "cloud") {
      console.log(
        `🔑 Print Service Token: ${PRINT_SERVICE_TOKEN.substring(0, 15)}...`,
      );
    }
  });
}

module.exports = app;
