// import { WebSocketServer } from "ws";

// const wss = new WebSocketServer({ port: 8080 }); // Run WebSocket on port 8080
// const clients = new Set();

// wss.on("connection", (ws) => {
//   console.log("Client connected");
//   clients.add(ws);

//   ws.on("close", () => {
//     clients.delete(ws);
//     console.log("Client disconnected");
//   });
// });

// // Function to broadcast notifications
// export const sendNotification = (message: string) => {
//   clients.forEach((ws) => ws.send(JSON.stringify({ message })));
// };
