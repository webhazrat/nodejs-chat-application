// external imports
import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    text: {
      type: String,
    },
    attachment: [
      {
        type: String,
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
    },
    data_time: {
      type: Date,
      default: Date.now,
    },
    conversation_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
