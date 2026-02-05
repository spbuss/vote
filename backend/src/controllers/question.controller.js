import Question from "../models/Question.js";
import Comment from "../models/Comment.js";
import { io } from "../server.js";

/* 🔥 Trending score formula */
const calculateTrendingScore = (q) => {
  const votes = q.yesVotes + q.noVotes;
  const likes = q.likes.length;
  const comments = q.commentsCount;

  const ageInHours =
    (Date.now() - new Date(q.createdAt).getTime()) / 36e5;

  return (
    votes * 2 +
    likes * 3 +
    comments * 4 -
    ageInHours * 0.5 +
    (q.sponsored ? 50 : 0)
  );
};

/* 📝 Create Poll */
export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      author: req.user.id,
      content: req.body.content,
      category: req.body.category,
      location: req.body.location
    });

    res.status(201).json(question);
  } catch {
    res.status(500).json({ message: "Failed to create poll" });
  }
};

/* 🗳️ Vote */
export const voteQuestion = async (req, res) => {
  try {
    const { vote } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question)
      return res.status(404).json({ message: "Poll not found" });

    const alreadyVoted = question.voters.find(
      (v) => v.userId.toString() === req.user.id
    );
    if (alreadyVoted)
      return res.status(400).json({ message: "Already voted" });

    question.voters.push({ userId: req.user.id, vote });

    vote === "yes" ? question.yesVotes++ : question.noVotes++;

    question.trendingScore = calculateTrendingScore(question);
    await question.save();

    io.emit("pollUpdated", question);

    res.json(question);
  } catch {
    res.status(500).json({ message: "Vote failed" });
  }
};

/* ❤️ Like / Unlike */
export const likeQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Poll not found" });

    const liked = question.likes.includes(req.user.id);

    if (liked) {
      question.likes.pull(req.user.id);
    } else {
      question.likes.push(req.user.id);
    }

    question.trendingScore = calculateTrendingScore(question);
    await question.save();

    io.emit("pollUpdated", question);

    res.json(question);
  } catch {
    res.status(500).json({ message: "Like failed" });
  }
};

/* 🔥 Trending Feed */
export const getTrendingQuestions = async (req, res) => {
  const polls = await Question.find()
    .sort({ trendingScore: -1, createdAt: -1 })
    .limit(20)
    .populate("author", "name username avatar");

  res.json(polls);
};

/* 📰 Instagram-style Feed */
export const getFeed = async (req, res) => {
  const polls = await Question.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("author", "name username avatar");

  res.json(polls);
};
