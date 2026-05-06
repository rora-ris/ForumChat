const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
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
server.listen(3001, () => {
  console.log("Server running on port 3001");
});