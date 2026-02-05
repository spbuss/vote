import { api } from "./api";

const token = () => localStorage.getItem("token") || "";

export const getFeed = () =>
  api("/api/questions/feed");

export const getTrending = () =>
  api("/api/questions/trending");

export const createPoll = (content: string, category: string) =>
  api(
    "/api/questions",
    "POST",
    { content, category },
    token()
  );

export const votePoll = (id: string, vote: "yes" | "no") =>
  api(
    `/api/questions/${id}/vote`,
    "POST",
    { vote },
    token()
  );

export const likePoll = (id: string) =>
  api(
    `/api/questions/${id}/like`,
    "POST",
    null,
    token()
  );
