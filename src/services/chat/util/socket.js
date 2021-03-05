const ConversationModel = require("../shemas/conversationModel");
const MessageModel = require("../shemas/messageModel");
const mongoose = require("mongoose");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

const createConversation = async (participants) => {
  try {
    //CREATE A CONVERSATION BETWEEN PARTICIPANTS
    console.log(participants.participants);
    const uniqueParticipants = [...new Set(participants.participants)];
    if (uniqueParticipants.length > 1) {
      //its a group convo
      const newConversation = new ConversationModel({
        creator: participants.currentUserId,
        participants: [participants.currentUserId, ...uniqueParticipants],
        oneDay: participants.oneDay,
      });
      const saved = await newConversation.save();
      return saved;
    } else {
      //its a private convo
      const findConversation = await ConversationModel.find({
        $or: [
          {
            creator: participants.currentUserId,
            creator2: participants.participants[0],
          },
          {
            creator: participants.participants[0],
            creator2: participants.currentUserId,
          },
        ],
      });
      if (findConversation.length === 0) {
        const newConversation = new ConversationModel({
          creator: participants.currentUserId,
          creator2: participants.participants[0],
          participants: [
            participants.currentUserId,
            participants.participants[0],
          ],
          oneDay: participants.oneDay,
        });
        const saved = await newConversation.save();
        return saved;
      } else {
        return { error: "convo existing" };
      }
    }
  } catch (error) {
    next(await errorHandler(error));
  }
};

const createMessage = async (messageObject) => {
  try {
    //CREATE MESSAGE
    const { convoId, sender, content, url, to } = messageObject;
    const selectedConvo = await ConversationModel.findById(convoId);
    if (selectedConvo) {
      const user = await User.findById(sender);
      let findIfUserExistInConvo = [];
      if (to !== undefined) {
        findIfUserExistInConvo = await ConversationModel.find({
          $and: [{ participants: to }, { participants: user._id }],
        });
      }

      if (user) {
        if (selectedConvo.participants.length === 2 && to === undefined) {
          return { error: "'to' userid required" };
        } else if (findIfUserExistInConvo.length === 0) {
          return { error: "user not found in convo" };
        } else {
          const newConvo = new MessageModel(messageObject);
          const saved = await newConvo.save();
          return saved;
        }
      } else {
        return { error: "user not found" };
      }
    } else {
      return { error: "Convo not found" };
    }
  } catch (error) {
    next(await errorHandler(error));
  }
};

const deleteMessage = async (messageId, userId) => {
  try {
    //ONLY SENDER CAN DELETE
    console.log(messageId, userId);
    const message = await MessageModel.findById(
      mongoose.Types.ObjectId(messageId)
    );
    if (message.sender.toString() === userId) {
      await MessageModel.findByIdAndDelete(mongoose.Types.ObjectId(messageId));
      return { msg: "message deleted" };
    } else {
      return { error: "Not Authorized" };
    }
  } catch (error) {
    next(await errorHandler(error));
  }
};

const addParticipantToConvo = async (participant, convoId) => {
  try {
    //ADD PARTICIPANT TO USER, UPDATE EXISTING CONVO
    //ONLY CREATOR CAN ADD
    const selectedConvo = await ConversationModel.findById(convoId);
    if (selectedConvo) {
      const updateConvo = await ConversationModel.findByIdAndUpdate(convoId, {
        $addToSet: { participants: participant },
      });
      return updateConvo;
    } else {
      console.log("convo not found");
    }
  } catch (error) {
    next(await errorHandler(error));
  }
};

const removeParticipantFromConvo = async (convoId, userId, participant) => {
  try {
    //ADD PARTICIPANT TO USER, UPDATE EXISTING CONVO
    //ONLY CREATOR CAN REMOVE
    const convo = await ConversationModel.findById(convoId);
    console.log(convo.creator.toString() === userId);
    if (
      convo.creator.toString() === userId ||
      convo.creator2.toString() === userId
    ) {
      const updateConvo = await ConversationModel.findByIdAndUpdate(convoId, {
        $pull: { participants: participant },
      });
      return updateConvo;
    } else {
      return { error: "Not authorized" };
    }
  } catch (error) {
    next(await errorHandler(error));
  }
};

const getUsersInConvo = (convoId) => {
  try {
    //RETURN ALL USERS BELONGING TO CONVOID
  } catch (error) {
    console.log(error);
  }
};

const getAllConvoByUserId = async (userId) => {
  try {
    const convos = await ConversationModel.find({
      $or: [
        {
          creator: userId,
        },
        {
          creator2: userId,
        },
        { participants: userId },
      ],
    });
    return convos;
  } catch (error) {
    next(await errorHandler(error));
  }
};

const likeMessage = async (msgId, userId) => {
  try {
    const message = await MessageModel.findById(msgId);
    const findLiked = message.like.filter((l) => l.toString() === userId);
    if (findLiked.length > 0) {
      const newLiked = message.like.filter((l) => l.toString() !== userId);
      console.log(newLiked);
      await MessageModel.findByIdAndUpdate(msgId, {
        $set: { like: newLiked },
      });
      return { msg: `${userId} removed like` };
    } else {
      await MessageModel.findByIdAndUpdate(msgId, { $push: { like: userId } });
      return { msg: `${userId} liked this message` };
    }
  } catch (error) {
    next(await errorHandler(error));
  }
};

module.exports = {
  createConversation,
  createMessage,
  deleteMessage,
  addParticipantToConvo,
  removeParticipantFromConvo,
  getUsersInConvo,
  getAllConvoByUserId,
  likeMessage,
};
