import { Portfolio } from "@/types/portfolio";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getMockPortfolio = async (): Promise<Portfolio> => {
  const res = await fetch(`${API_BASE}/portfolio/mock`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch mock portfolio.");
  return res.json();
};

export const getCSVPortfolio = async (
  formData: FormData,
): Promise<Portfolio> => {
  const res = await fetch(`${API_BASE}/portfolio/csv`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to fetch CSV portfolio.");
  return res.json();
};

export const getQuestradePortfolio = async (
  token: string,
): Promise<Portfolio> => {
  const res = await fetch(`${API_BASE}/portfolio/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: token }),
  });
  if (!res.ok) throw new Error("Failed to fetch questrade portfolio.");
  return res.json();
};
