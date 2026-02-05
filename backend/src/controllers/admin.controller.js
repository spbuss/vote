import User from "../models/User.js";
import Question from "../models/Question.js";
import Comment from "../models/Comment.js";

/* 👮 Get all reported polls */
export const getReportedPolls = async (req, res) => {
  const polls = await Question.find({ reported: true })
    .populate("author", "name username");

  res.json(polls);
};

/* 🗑️ Delete poll */
export const deletePoll = async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  await Comment.deleteMany({ question: req.params.id });

  res.json({ success: true });
};

/* 🚫 Ban / Unban user */
export const toggleBanUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.banned = !user.banned;
  await user.save();

  res.json({ banned: user.banned });
};

/* 💬 Get reported comments */
export const getReportedComments = async (req, res) => {
  const comments = await Comment.find({ reported: true })
    .populate("user", "name");

  res.json(comments);
};

/* 🧹 Delete comment */
export const deleteComment = async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* 👥 User list */
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
