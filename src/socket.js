const socketio = require("socket.io");
const RoomModel = require("../src/services/chat/shemas/roomschema");
const MessageModel = require("../src/services/chat/shemas/messagesschema");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

// 1) CREATE CHAT ROOM BETWEEN TWO USERS
// 2) CREATE MESSAGE
// 3) ADD USERS TO CHATROOM
// 4)

const createSocketServer = (server) => {
  const io = socketio(server);
  //LISTENING OF EVENTS
  io.on("connection", (socket) => {
    console.log(`Socket connection has this socket id: ${socket.id}`);

    socket.on("joinRoom", async () => {
      try {
        //add users to spesific room (in mongo)
        await addUserToRoom();

        socket.join();
      } catch (error) {
        next(await errorHandler(error));
      }
    });

    socket.on("message", () => {});
  });
};

module.exports = createSocketServer;
