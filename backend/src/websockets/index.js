import { WebSocketServer } from "ws";

let wss;

export const setupWebSocket = (httpServer) => {
    wss = new WebSocketServer({server: httpServer});

    wss.on("connection", (socket) => {
        console.log("New Websocket connection");
        socket.on("message", (message) => {
            console.log("Received: ", message.toString());
        });
        socket.on("close", () => {
            console.log("Websocket connection close");
        });
    });
    return wss;
}
export const getWss = () => {
    return wss;
}

