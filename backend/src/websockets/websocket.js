import { WebSocketServer } from "ws"; // import the WebSocket server class
import { getAllComments, createComment } from "../services/comment-service.js";

let wss;

export const setupWebSocket = (httpServer) => {
  wss = new WebSocketServer({ server: httpServer }); // attach WebSocket server to your existing HTTP server

  wss.on("connection", async (socket, req) => {
    console.log("New Websocket connection"); // log every new connection

    const params = new URL(req.url, "http://localhost").searchParams; // parse the query params from the upgrade request
    const targetType = params.get("targetType"); // e.g. "Match" or "Tournament"
    const targetId = params.get("targetId"); // e.g. "665a1f3b..."

    socket.targetType = targetType; // label this socket with what kind of room it joined e.g, Match or Tournament
    socket.targetId = targetId;  // label this socket with which specific chat room it belongs to

    // Send existing comment history when a client connects
    if (targetType && targetId) {
      try {
        const result = await getAllComments({
          targetType, // filter by match or tournament
          targetId, // filter by the specific match or tournament
          page: 1,
          limit: 50,
        });

        socket.send(
          JSON.stringify({
            type: "history", // tells the frontend this is a history comment e.g, posted earlier
            messages: result.results, // the array of comment documents
          }),
        );
      } catch (err) {
        console.error("Error fetching comment history:", err); // log the error server-side
      }
    }

    // Listen for incoming messages
    socket.on("message", async (raw) => {
      const data = JSON.parse(raw); // parse the comment the user made to a json object

      try {
        const comment = await createComment(data.authorId, {
          text: data.text, // the comment text from the frontend e.g, what the user typed
          targetType: socket.targetType, // scoped to this page's target type
          targetId: socket.targetId, // scoped to this page's target ID
        });

        const outgoing = JSON.stringify({
          type: "new_message", // tells the frontend this is a single new comment
          message: comment, // the saved and populated comment
        });

        
        wss.clients.forEach((client) => { // Broadcast to every connected client viewing the same page
          if (
            client.readyState === socket.OPEN && // only send to open connections
            client.targetType === socket.targetType && // same target type
            client.targetId === socket.targetId // same specific page
          ) {
            client.send(outgoing); // send the new comment to this client
          }
        });
      } catch (err) {
        console.error("Error saving comment:", err); // log the full error server-side, for debugging
        socket.send(
          JSON.stringify({
            type: "error", // notify the sender that saving failed
            message: err.message, 
          }),
        );
      }
    });

    socket.on("close", () => {
      console.log("Websocket connection closed"); // log when a client disconnects e.g, goes away from the match or tournament
    });
  });

  return wss; // return the wss instance in case it's needed elsewhere
};

export const getWss = () => {
  return wss; // getter so other parts of the app can access the WebSocket server
};
