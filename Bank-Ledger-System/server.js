require("dotenv").config({ path: "./src/.env" });

const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      await require("mongoose").connection.close();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();