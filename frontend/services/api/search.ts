import { api } from "./api";

export const autoSuggest = (q: string) =>
  api(`/api/search/suggest?q=${q}`);

export const personalizedTrending = () =>
  api(
    "/api/search/personalized",
    "GET",
    null,
    localStorage.getItem("token") || ""
  );
