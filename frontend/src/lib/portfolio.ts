import { Portfolio } from "@/types/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getMockPortfolio = async (): Promise<Portfolio> => {
  const res = await fetch(`${API_BASE}/portfolio/mock`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch mock portfolio");
  return res.json();
};

export const getCSVPortfolio = async (
  formData: FormData,
): Promise<Portfolio> => {
  const res = await fetch(`${API_BASE}/portfolio/csv`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to fetch CSV portfolio");
  return res.json();
};

export const getQuestradePortfolio = async (): Promise<Portfolio> => {
  const res = await fetch(`${API_BASE}/portfolio/`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch questrade portfolio");
  return res.json();
};
