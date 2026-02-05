import Question from "../models/Question.js";
import { calculateScore } from "../utils/ranking.js";

/* 🔍 Auto-suggest search */
export const autoSuggest = async (req, res) => {
  const q = req.query.q || "";

  const suggestions = await Question.find({
    content: { $regex: q, $options: "i" }
  })
    .limit(5)
    .select("content category");

  res.json(suggestions);
};

/* 📊 Personalized Trending */
export const personalizedTrending = async (req, res) => {
  const user = req.user;

  const polls = await Question.find();

  const ranked = polls.map((p) => {
    const age =
      (Date.now() - new Date(p.createdAt).getTime()) / 36e5;

    const interestBoost =
      user.interests?.includes(p.category) ? 20 : 0;

    return {
      poll: p,
      score: calculateScore({
        votes: p.yesVotes + p.noVotes,
        likes: p.likes.length,
        comments: p.commentsCount,
        hoursOld: age,
        isSponsored: p.sponsored,
        userInterestBoost: interestBoost
      })
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  res.json(ranked.slice(0, 20).map((r) => r.poll));
};

/* 🌍 Location Trending */
export const locationTrending = async (req, res) => {
  const { country, city } = req.query;

  const polls = await Question.find({
    "location.country": country,
    ...(city && { "location.city": city })
  })
    .sort({ trendingScore: -1 })
    .limit(20);

  res.json(polls);
};

/* 💰 Sponsored Trending */
export const sponsoredTrending = async (req, res) => {
  const polls = await Question.find({ sponsored: true })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(polls);
};

/* 📰 Explore Feed (Instagram style) */
export const exploreFeed = async (req, res) => {
  const polls = await Question.find()
    .sort({ likes: -1, createdAt: -1 })
    .limit(30);

  res.json(polls);
};
