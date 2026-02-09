/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import { connectRedis } from "./app/config/redis.config";

let server: Server;


const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
        console.log("Database connected successfully");
    server = app.listen(envVars.PORT, () => {
        console.log(`Server is running on Port: ${envVars.PORT}`);
    });
  } catch (error: any) {
    console.error("Server Error", error.message)
  }
}

(async () => {
  await connectRedis()
  await startServer()
  await seedSuperAdmin()
})();


process.on("SIGINT", () => {
    console.log("SIGINT signal received, we are closing our server...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
}
    process.exit(1);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received, we are closing our server...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
}
    process.exit(1);
});

process.on("unhandledRejection", () => {
    console.log("Unhandled Rejection is detected, we are closing our server...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
}
    process.exit(1);
});


process.on("uncaughtException", () => {
    console.log("Uncaught Exception is detected, we are closing our server...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
}
    process.exit(1);
});

