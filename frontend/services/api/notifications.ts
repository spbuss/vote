import { api } from "./api";

const token = () => localStorage.getItem("token") || "";

export const getNotifications = () =>
  api("/api/notifications", "GET", null, token());

export const markRead = (id: string) =>
  api(`/api/notifications/${id}/read`, "POST", null, token());
