// extermal imports
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import moment from "moment/moment.js";
import { Server } from "socket.io";
import http from "http";

// internal imports
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/common/errorHandler.js";
import loginRouter from "./router/loginRouter.js";
import usersRouter from "./router/usersRouter.js";
import inboxRouter from "./router/inboxRouter.js";

const app = express();
const server = http.createServer(app);
dotenv.config();

// socket creation
const io = new Server(server);

let onlineUsers = [];
io.on("connection", (socket) => {
  console.log("Server socket connected!");
  console.log("A user connected!");

  const userId = socket.handshake.auth.userId;
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId: socket.id });
  }
  io.emit("getOnlineUser", onlineUsers);

  socket.on("disconnect", () => {
    console.log("A user disconnected!");

    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUser", onlineUsers);
  });

  socket.on("offline", () => {
    console.log("A user offline!");
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUser", onlineUsers);
  });
});

global.io = io;

// set moment as app.locals
app.locals.moment = moment;

// database connection
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log(err));

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

// set static folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing setup
app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// 404 not found handler
app.use(notFoundHandler);

// common error handler
app.use(errorHandler);

// server listener
server.listen(process.env.PORT, () => {
  console.log(`App listening to post ${process.env.PORT}`);
});
