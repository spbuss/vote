import { api } from "./api";

const token = () => localStorage.getItem("token") || "";

export const getComments = (questionId: string) =>
  api(`/api/comments/${questionId}`);

export const addComment = (
  questionId: string,
  text: string,
  parentComment?: string
) =>
  api(
    `/api/comments/${questionId}`,
    "POST",
    { text, parentComment },
    token()
  );

export const likeComment = (commentId: string) =>
  api(
    `/api/comments/like/${commentId}`,
    "POST",
    null,
    token()
  );
