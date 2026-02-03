require("dotenv").config();
const packageInfo = require("./package.json");
const express = require("express");
const config = require("./config/app.config");
const logger = require("./src/logger");
const cors = require("cors");
const boom = require("express-boom");

const routes = require("./src/routes");

const app = express();

// @Database Connection
require("./config/database.config");

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// Token de API esperado
const API_KEY = process.env.API_KEY || "cj_sk_2024_x7k9m2p4q5r6s8t9";

// Dominios permitidos para CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // URL de Vercel
].filter(Boolean); // Elimina undefined/null

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, curl, etc.) solo en desarrollo
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

// Middleware para validar API Key
const validateApiKey = (req, res, next) => {
  // Excluir el endpoint de health check
  if (req.path === "/health" || req.path === "/") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ 
      error: "API Key no proporcionada",
      message: "Se requiere el header X-API-Key" 
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(401).json({ 
      error: "API Key inválida",
      message: "Las credenciales proporcionadas no son válidas" 
    });
  }

  next();
};

// ============================================
// MIDDLEWARES
// ============================================

app.use(express.json());
app.use(cors(corsOptions));
app.use(boom());

// Validar API Key en todas las rutas (excepto /health)
app.use(validateApiKey);

// ============================================
// HEALTH CHECK (para UptimeRobot)
// ============================================

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: packageInfo.name,
    version: packageInfo.version
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Sales Point API",
    version: packageInfo.version,
    health: "/health"
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
  app.listen(port, () => {
    logger.info(`Application ${packageInfo.name} started at port ${port}`, {
      type: "application_start",
      applicationName: packageInfo.name,
      version: packageInfo.version,
      port,
    });
    console.log(`🔒 CORS habilitado para: ${allowedOrigins.join(", ")}`);
    console.log(`🔑 API Key configurada: ${API_KEY.substring(0, 10)}...`);
  });
}

module.exports = app;
