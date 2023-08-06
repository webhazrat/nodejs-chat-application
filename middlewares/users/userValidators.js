// external imports
import { check, validationResult } from "express-validator";
import createError from "http-errors";
import path from "path";
import { unlink } from "fs";

// internal imports
import PeopleModel from "../../models/People.js";

// __dirname
const __dirname = path.resolve();

// add user validation
export const addUserValidators = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required!")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name must not contain anything other than alphabet!")
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Invalid email address!")
    .trim()
    .custom(async (value) => {
      try {
        const user = await PeopleModel.findOne({ email: value });
        if (user) {
          throw createError("Email already exist!");
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  check("mobile")
    .isMobilePhone("bn-BD", { strictMode: true })
    .withMessage(
      "Mobile number must be a valid Bangladeshi (+88) mobile number!"
    )
    .custom(async (value) => {
      try {
        const user = await PeopleModel.findOne({ mobile: value });
        if (user) {
          throw createError("Mobile number already exist!");
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long & should contain with lowercase, upercase, number & special!"
    ),
];

export const addUserValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // remove uploaded files
    if (req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(
        path.join(__dirname, `/public/uploads/avatars/${filename}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }

    // response the errors
    res.status(500).json({
      errors: mappedErrors,
    });
  }
};
