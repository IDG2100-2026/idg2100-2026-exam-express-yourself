import { WebSocketServer } from "ws";
import { handleGameMessage } from "./game-handler.js";

let wss;

export const setupWebSocket = (httpServer) => {
  wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (socket) => {
    socket.on("message", async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        await handleGameMessage(socket, message);
      } catch (err) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    socket.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  return wss;
};

export const getWss = () => wss;
