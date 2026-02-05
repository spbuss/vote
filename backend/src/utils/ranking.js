export const calculateScore = ({
  votes,
  likes,
  comments,
  hoursOld,
  isSponsored,
  userInterestBoost = 0
}) => {
  let score =
    votes * 2 +
    likes * 3 +
    comments * 4 -
    hoursOld * 0.4 +
    userInterestBoost;

  if (isSponsored) score += 100;

  return score;
};
