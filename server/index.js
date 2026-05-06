require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "forum_chat",
};

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let dbPool;

const initDatabase = async () => {
  dbPool = await mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await dbPool.query(
    "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, body TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
  );
};

const loadRecentMessages = async (limit = 50) => {
  const [rows] = await dbPool.query(
    "SELECT body FROM messages ORDER BY id DESC LIMIT ?",
    [limit]
  );
  return rows.map((row) => row.body).reverse();
};

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  loadRecentMessages()
    .then((messages) => socket.emit("chat_history", messages))
    .catch((error) => console.error("Failed to load history", error));

  socket.on("send_message", async (data) => {
    try {
      await dbPool.query("INSERT INTO messages (body) VALUES (?)", [data]);
      io.emit("receive_message", data);
    } catch (error) {
      console.error("Failed to store message", error);
    }
  });

  socket.on("clear_messages", async () => {
    try {
      await dbPool.query("DELETE FROM messages");
      io.emit("chat_cleared");
    } catch (error) {
      console.error("Failed to clear messages", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= REACT BUILD =================
app.use(express.static(path.join(__dirname, "../client/build")));

// fallback route (AMAN, tanpa "*")
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// ================= START SERVER =================
initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed", error);
    process.exit(1);
  });