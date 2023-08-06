// external imports
import express from "express";

// internal imports
import {
  addConversation,
  getInbox,
  getMessages,
  searchUser,
  sendMessage,
} from "../controllers/inboxController.js";
import decorateHtmlResponse from "../middlewares/common/decorateHtmlResponse.js";
import { checkLogin } from "../middlewares/common/checkLogin.js";
import { attachmentUpload } from "../middlewares/inbox/attachmentUpload.js";

const router = express.Router();

// inbox page
router.get("/", decorateHtmlResponse("Inbox"), checkLogin, getInbox);

// search user for conversation
router.post("/search", checkLogin, searchUser);

// add conversation
router.post("/conversation", checkLogin, addConversation);

// get messages of a conversation
router.get("/messages/:conversation_id", checkLogin, getMessages);

// sending message
router.post("/message", checkLogin, attachmentUpload, sendMessage);

export default router;
