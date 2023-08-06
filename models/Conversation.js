// external imports
import mongoose from "mongoose";

const conversationSchema = mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);

export default ConversationModel;
