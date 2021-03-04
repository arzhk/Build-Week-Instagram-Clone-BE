const RoomModel = require("../shemas/roomschema");
const MessageModel = require("../shemas/messagesschema");
const mongoose = require("mongoose");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

const createRoom = async (participants) => {
  try {
    console.log(participants.participants);
  } catch (error) {
    next(await errorHandler(error));
  }
};
