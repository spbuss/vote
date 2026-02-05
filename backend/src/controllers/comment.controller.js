import Comment from "../models/Comment.js";
import Question from "../models/Question.js";
import Notification from "../models/Notification.js";
import { io } from "../server.js";

/* 💬 Add Comment */
export const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      question: req.params.questionId,
      user: req.user.id,
      text: req.body.text,
      parentComment: req.body.parentComment || null
    });

    await Question.findByIdAndUpdate(req.params.questionId, {
      $inc: { commentsCount: 1 }
    });

    const question = await Question.findById(req.params.questionId);

    if (question.author.toString() !== req.user.id) {
      await Notification.create({
        user: question.author,
        fromUser: req.user.id,
        type: "comment",
        question: question._id,
        comment: comment._id
      });
    }

    io.emit("newComment", comment);

    res.status(201).json(comment);
  } catch {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

/* ❤️ Like Comment */
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    const liked = comment.likes.includes(req.user.id);

    liked
      ? comment.likes.pull(req.user.id)
      : comment.likes.push(req.user.id);

    await comment.save();

    io.emit("commentLiked", comment);

    res.json(comment);
  } catch {
    res.status(500).json({ message: "Like failed" });
  }
};

/* 📥 Get Comments */
export const getComments = async (req, res) => {
  const comments = await Comment.find({
    question: req.params.questionId,
    parentComment: null
  })
    .populate("user", "name avatar")
    .sort({ createdAt: 1 });

  res.json(comments);
};
