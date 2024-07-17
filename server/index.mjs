import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clientObj = {};

wss.on("connection", (connection) => {
  console.log("新的使用者已連線");

  connection.on("message", (message) => {
    let fromClientMsg = JSON.parse(message);

    if (fromClientMsg.type === "register") {
      // 使用者剛連線時傳來的註冊訊息
      let { userID } = fromClientMsg;
      clientObj[userID] = connection;
      connection.userID = userID;

      let allClients = Object.keys(clientObj);
      wss.clients.forEach((client) => {
        let toClientMsg = {
          type: "registered",
          allClients,
          userID,
        };
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(toClientMsg));
        }
      });
    }

    if (fromClientMsg.type === "message") {
      // 使用者傳送訊息來時，判斷是私訊還是廣播
      let fromID = fromClientMsg.userID;
      let { clientMsg } = fromClientMsg;
      let allClients = Object.keys(clientObj);
      let toClientMsg = {
        type: "message",
        fromID,
        allClients,
        clientMsg,
      };
      if (fromClientMsg.targetUserID) {
        toClientMsg.targetUserID = fromClientMsg.targetUserID;
        wss.clients.forEach((client) => {
          if (
            client.userID === fromClientMsg.targetUserID ||
            (client.userID === fromID && client.readyState === WebSocket.OPEN)
          ) {
            client.send(JSON.stringify(toClientMsg));
          }
        });
      } else {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(toClientMsg));
          }
        });
      }
    }
  });

  connection.on("close", () => {
    // 當使用者離線時會觸發
    console.log("使用者已離線");
    let dsID = connection.userID;
    if (dsID) {
      delete clientObj[dsID];
    }
    let allClients = Object.keys(clientObj);
    wss.clients.forEach((client) => {
      let toClientMsg = {
        type: "disconnected",
        dsID,
        allClients,
      };
      client.send(JSON.stringify(toClientMsg));
    });
  });
});
