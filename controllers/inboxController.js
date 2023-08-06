// external imports
import createError from "http-errors";

// internal imports
import PeopleModel from "../models/People.js";
import ConversationModel from "../models/Conversation.js";
import MessageModel from "../models/Message.js";

import escape from "../utilities/escape.js";

// get inbox page
export async function getInbox(req, res, next) {
  try {
    const conversations = await ConversationModel.find({
      $or: [{ creator: req.user.userId }, { participant: req.user.userId }],
    })
      .populate("creator", { _id: 1, name: 1, avatar: 1 })
      .populate("participant", { _id: 1, name: 1, avatar: 1 });
    res.locals.data = conversations;
    res.render("inbox");
  } catch (err) {
    next(err);
  }
}

// search user
export async function searchUser(req, res, next) {
  const user = req.body.user;
  const loggedInUserId = req.body.loggedInUserId;
  const searchQuery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

  try {
    if (searchQuery !== "") {
      const users = await PeopleModel.find(
        {
          $and: [
            {
              $or: [
                { name: name_search_regex },
                { mobile: mobile_search_regex },
                { email: email_search_regex },
              ],
            },
            {
              _id: { $ne: loggedInUserId },
            },
          ],
        },
        "name avatar"
      );
      res.json(users);
    } else {
      throw createError("You must provide some text to search");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// add conversation
export async function addConversation(req, res, next) {
  try {
    const existConversation = await ConversationModel.findOne({
      $and: [
        {
          $or: [{ creator: req.user.userId }, { creator: req.body.id }],
        },
        {
          $or: [{ participant: req.user.userId }, { participant: req.body.id }],
        },
      ],
    });

    if (!existConversation) {
      const newConversation = await ConversationModel.create({
        creator: req.user.userId,
        participant: req.body.id,
      });
      res.status(200).json({
        message: "Conversation was added successfully!",
      });
    } else {
      throw createError("Conversation already exist!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// get messages of a conversation
export async function getMessages(req, res, next) {
  try {
    const messages = await MessageModel.find({
      conversation_id: req.params.conversation_id,
    })
      .populate("sender", { _id: 1, name: 1, avatar: 1 })
      .populate("receiver", { _id: 1, name: 1, avatar: 1 })
      .sort("-createdAt");

    const { participant } = await ConversationModel.findById(
      req.params.conversation_id
    ).populate("participant", { _id: 1, name: 1, avatar: 1 });

    res.status(200).json({
      data: {
        messages,
        participant,
      },
      user: req.user.userId,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          mes: err.message,
        },
      },
    });
  }
}

// sending message
export async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // save message text/attachment in database
      let attachments = null;
      if (req.files && req.files.length > 0) {
        attachments = [];

        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
      }

      const newMessage = await MessageModel.create({
        text: req.body.message,
        attachment: attachments,
        sender: req.user.userId,
        receiver: req.body.receiverId,
        conversation_id: req.body.conversationId,
      });

      // emit socket event
      global.io.emit("new_message", {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userId,
            name: req.user.username,
            avatar: req.user.avatar || null,
          },
          message: req.body.message,
          attachment: attachments,
          date_time: newMessage.date_time,
        },
      });

      res.status(200).json({
        message: "Message send successfully!",
        data: newMessage,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: {
          msg: "Message text or attachment is required!",
        },
      },
    });
  }
}
