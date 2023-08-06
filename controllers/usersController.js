// external imports
import bcrypt from "bcrypt";
import { unlink } from "fs";
import path from "path";

const __dirname = path.resolve();

// internal imports
import PeopleModel from "../models/People.js";

// get users page
export async function getUsers(req, res, next) {
  try {
    const users = await PeopleModel.find();
    res.render("users", {
      users: users,
    });
  } catch (err) {
    next(err);
  }
}

// add user
export async function addUser(req, res, next) {
  let newUser;
  const hashPassword = await bcrypt.hash(req.body.password, 10);
  if (req.files && req.files.length > 0) {
    newUser = {
      ...req.body,
      avatar: req.files[0].filename,
      password: hashPassword,
    };
  } else {
    newUser = {
      ...req.body,
      password: hashPassword,
    };
  }

  // create user or send error
  try {
    const result = await PeopleModel.create(newUser);
    res.status(200).json({
      message: "User added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error occured!",
        },
      },
    });
  }
}

// remove user
export async function removeUser(req, res, next) {
  try {
    const user = await PeopleModel.findByIdAndDelete({
      _id: req.params.id,
    });

    // remove user avatar if any
    if (user.avatar) {
      unlink(
        path.join(__dirname, `/public/uploads/avatars/${user.avatar}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }

    res.status(500).json({
      message: "User was removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the user!",
        },
      },
    });
  }
}
