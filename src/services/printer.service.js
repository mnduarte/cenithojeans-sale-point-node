/**
 * Printer Service
 * 
 * Maneja la impresión térmica con fallback a consola.
 * Usa variables de entorno para configurar el comportamiento.
 * 
 * VARIABLES DE ENTORNO:
 * - USE_PRINTER: "true" para usar impresora física, cualquier otro valor usa consola
 * - PRINTER_NAME: Nombre de la impresora (default: "SAM4S GIANT-100")
 * - PRINTER_CUT_COMMAND: Comando ESC/POS para cortar papel (ver opciones abajo)
 * 
 * COMANDOS DE CORTE COMUNES:
 * - "\x1B\x69"     = Corte completo (full cut) - Estándar SAM4S
 * - "\x1B\x6D"     = Corte parcial (partial cut)  
 * - "\x1B"         = Solo ESC (algunos drivers lo interpretan como corte)
 * - "\x1D\x56\x00" = GS V 0 - Corte completo (estándar ESC/POS)
 * - "\x1D\x56\x01" = GS V 1 - Corte parcial (estándar ESC/POS)
 * - ""             = Sin comando de corte (dejar que el driver lo maneje)
 */

const USE_PRINTER = process.env.USE_PRINTER === "true";
const PRINTER_NAME = process.env.PRINTER_NAME || "SAM4S GIANT-100";

// Parsear el comando de corte desde variable de entorno
// Permite usar notación con \x para códigos hex
const parseCutCommand = (envValue) => {
  if (envValue === undefined || envValue === null) {
    return "\x1B"; // Default
  }
  if (envValue === "" || envValue === "none" || envValue === "NONE") {
    return ""; // Sin corte
  }
  // Convertir strings como "\\x1B\\x69" a bytes reales "\x1B\x69"
  return envValue.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
};

const PRINTER_CUT_COMMAND = parseCutCommand(process.env.PRINTER_CUT_COMMAND);

let printer = null;

// Intentar cargar el módulo de impresora solo si está habilitado
if (USE_PRINTER) {
  try {
    printer = require("@woovi/node-printer");
    console.log(`✅ Printer module loaded. Using printer: ${PRINTER_NAME}`);
    console.log(`   Cut command: ${PRINTER_CUT_COMMAND ? `"${Buffer.from(PRINTER_CUT_COMMAND).toString('hex')}"` : "(none)"}`);
  } catch (e) {
    console.warn("⚠️ Printer module not available, using console fallback");
    console.warn("   Install with: npm install @woovi/node-printer");
  }
} else {
  console.log("ℹ️ Printer disabled (USE_PRINTER !== 'true'). Using console output.");
}

/**
 * Prepara los datos para imprimir agregando saltos de línea y comando de corte
 * @param {string} ticketContent - Contenido del ticket
 * @returns {string} - Datos listos para enviar a la impresora
 */
const prepareTicketData = (ticketContent) => {
  return `${ticketContent}\n\n\n\n${PRINTER_CUT_COMMAND}`;
};

/**
 * Imprime un ticket
 * @param {string} data - Datos RAW a imprimir (ya con comandos ESC/POS y corte)
 * @returns {Promise<{success: boolean, message: string, jobID?: string}>}
 */
const printTicket = (data) => {
  return new Promise((resolve, reject) => {
    if (printer) {
      // Impresión real
      printer.printDirect({
        data: data,
        printer: PRINTER_NAME,
        type: "RAW",
        success: function (jobID) {
          console.log("🖨️ Sent to printer with ID: " + jobID);
          resolve({ success: true, message: "Impreso correctamente", jobID });
        },
        error: function (err) {
          console.error("❌ Printer error:", err);
          reject({ success: false, message: "Error de impresión", error: err });
        },
      });
    } else {
      // Fallback: mostrar en consola
      console.log("\n" + "=".repeat(42));
      console.log("          📄 TICKET (SIMULADO)");
      console.log("=".repeat(42));
      // Limpiar códigos ESC/POS para mejor visualización en consola
      const cleanData = data
        .replace(/\x1B\x45I/g, "") // Bold
        .replace(/\x1B\x46/g, "")  // Normal
        .replace(/\x1B\x69/g, "")  // Cut
        .replace(/\x1B\x6D/g, "")  // Partial cut
        .replace(/\x1D\x56[\x00\x01]/g, "") // GS V cut
        .replace(/\x1B/g, "");     // Otros ESC
      console.log(cleanData);
      console.log("=".repeat(42) + "\n");
      resolve({ success: true, message: "Impreso en consola (simulado)" });
    }
  });
};

/**
 * Imprime un ticket (versión simplificada que prepara los datos automáticamente)
 * @param {string} ticketContent - Contenido del ticket (sin comandos de corte)
 * @returns {Promise<{success: boolean, message: string, jobID?: string}>}
 */
const printTicketAuto = (ticketContent) => {
  const preparedData = prepareTicketData(ticketContent);
  return printTicket(preparedData);
};

/**
 * Verifica si la impresora está disponible
 * @returns {boolean}
 */
const isPrinterAvailable = () => {
  return printer !== null;
};

/**
 * Obtiene la lista de impresoras disponibles
 * @returns {string[]}
 */
const getAvailablePrinters = () => {
  if (printer) {
    try {
      return printer.getPrinters().map((p) => p.name);
    } catch (e) {
      return [];
    }
  }
  return [];
};

module.exports = {
  printTicket,
  printTicketAuto,
  prepareTicketData,
  isPrinterAvailable,
  getAvailablePrinters,
  PRINTER_NAME,
  PRINTER_CUT_COMMAND,
  USE_PRINTER,
};
