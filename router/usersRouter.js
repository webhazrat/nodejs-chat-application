// external imports
import express from "express";

// internal imports
import {
  addUser,
  getUsers,
  removeUser,
} from "../controllers/usersController.js";
import decorateHtmlResponse from "../middlewares/common/decorateHtmlResponse.js";
import avatarUpload from "../middlewares/users/avatarUpload.js";
import {
  addUserValidationHandler,
  addUserValidators,
} from "../middlewares/users/userValidators.js";

import { checkLogin, requireRole } from "../middlewares/common/checkLogin.js";

const router = express.Router();

// users page
router.get(
  "/",
  decorateHtmlResponse("Users"),
  checkLogin,
  requireRole(["admin"]),
  getUsers
);

// user create
router.post(
  "/",
  checkLogin,
  requireRole(["admin"]),
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);

// remove user
router.delete("/:id", requireRole(["admin"]), removeUser);

export default router;
