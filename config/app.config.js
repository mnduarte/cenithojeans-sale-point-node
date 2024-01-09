module.exports = {
  local: {
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 30040,
    routes: {
      cors: {
        origin: ["*"],
        additionalHeaders: [
          "Cache-Control",
          "Accept-Encoding",
          "Accept-Language",
          "Access-Control-Request-Headers",
          "Access-Control-Request-Method",
          "Access-Control-Allow-Origin",
          "Connection",
          "Host",
          "Pragma",
          "User-Agent",
        ],
      },
      validate: {
        failAction: async (request, h, err) => {
          if (process.env.NODE_ENV === "production") {
            // In prod, log a limited error message and throw the default Bad Request error.
            console.error(
              `ValidationError at: ${request.url.path}`,
              err.message
            );
            throw err.badRequest("Invalid request payload input");
          } else {
            // During development, log and respond with the full error.
            console.error(err);
            throw err;
          }
        },
      },
    },
  },
};
