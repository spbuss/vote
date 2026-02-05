import { API_BASE_URL } from "../../config";

export const api = async (
  path: string,
  method: string = "GET",
  body?: any,
  token?: string
) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
};
