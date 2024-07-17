import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clients = {};
wss.on("connection", (connection) => {
  console.log("新的使用者已連線");

  connection.on("message", (message) => {
    const fromClientMsg = JSON.parse(message);

    if (fromClientMsg.type === "register") {
      const { userID } = fromClientMsg;
      clients[userID] = connection;
      connection.userID = userID;

      const otherClients = Object.keys(clients);
      wss.clients.forEach((client) => {
        let toClientMsg = {
          type: "registered",
          otherClients,
        };
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(toClientMsg));
        }
      });
    }

    if (fromClientMsg.type === "message") {
      let message = fromClientMsg.toServerMsg;
      let fromID = fromClientMsg.userID;
      const otherClients = Object.keys(clients);
      let toClientMsg = {
        type: "message",
        fromID,
        message,
      };
      if (fromClientMsg.targetUserID) {
        toClientMsg.targetUserID = fromClientMsg.targetUserID;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            if (
              client.userID === fromClientMsg.targetUserID ||
              client.userID === fromID
            ) {
              client.send(JSON.stringify(toClientMsg));
            } else {
              return;
            }
          }
        });
      } else {
        toClientMsg.otherClients = otherClients;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(toClientMsg));
          }
        });
      }
    }
  });

  connection.on("close", () => {
    let dsID = connection.userID;
    if (dsID) {
      delete clients[dsID];
    }
    const otherClients = Object.keys(clients);
    wss.clients.forEach((client) => {
      let toClientMsg = {
        type: "disconnected",
        otherClients,
      };
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(toClientMsg));
      }
    });
  });
});
