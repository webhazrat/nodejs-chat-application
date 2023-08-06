// external imports
import express from "express";

// internal imports
import { getLogin, login, logout } from "../controllers/loginController.js";
import decorateHtmlResponse from "../middlewares/common/decorateHtmlResponse.js";
import {
  doLoginValidationHandler,
  doLoginValidators,
} from "../middlewares/login/loginValidators.js";
import { redirectLoggedIn } from "../middlewares/common/checkLogin.js";

const router = express.Router();

// login page
router.get("/", decorateHtmlResponse("Login"), redirectLoggedIn, getLogin);

// process login
router.post(
  "/",
  decorateHtmlResponse("Login"),
  doLoginValidators,
  doLoginValidationHandler,
  login
);

// do logout
router.delete("/", logout);

export default router;
