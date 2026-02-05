import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "General"
    },
    yesVotes: {
      type: Number,
      default: 0
    },
    noVotes: {
      type: Number,
      default: 0
    },
    voters: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        vote: {
          type: String,
          enum: ["yes", "no"]
        }
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    commentsCount: {
      type: Number,
      default: 0
    },
    trendingScore: {
      type: Number,
      default: 0
    },
    sponsored: {
      type: Boolean,
      default: false
    },
    location: {
      country: String,
      city: String
    },
    reported: {
      type: Boolean,
      default: false
    },
    sponsored: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
