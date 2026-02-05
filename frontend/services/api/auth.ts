import { api } from "./api";

export const login = (email: string, password: string) =>
  api("/api/auth/login", "POST", { email, password });

export const signup = (name: string, email: string, password: string) =>
  api("/api/auth/register", "POST", { name, email, password });
