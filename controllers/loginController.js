// external imports
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "http-errors";

// internal imports
import PeopleModel from "./../models/People.js";

// get login page
export function getLogin(req, res, next) {
  res.render("index");
}

// do login
export async function login(req, res, next) {
  try {
    // find a user who has this email/mobile
    const user = await PeopleModel.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });

    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (isValidPassword) {
        // prepare the user object to generate token
        const userObject = {
          userId: user._id,
          username: user.name,
          mobile: user.mobile,
          email: user.email,
          avatar: user.avatar || null,
          role: "user",
        };

        // generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        // set object is user local identifier
        res.locals.loggedInUser = userObject;

        res.redirect("/inbox");
      } else {
        throw createError("Login failed! Please try again.");
      }
    } else {
      throw createError("Login failed! Please try again.");
    }
  } catch (err) {
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// do logout
export function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.send("logged out");
}
