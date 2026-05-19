import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "../app/types/user";

export function getDateKeyInSaoPaulo(date = new Date()): string {
  const parts = date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // → "18/05/2026"
  const [d, m, y] = parts.split("/");
  return `${y}-${m}-${d}`; // → "2026-05-18"
}

export function getDateBrInSaoPaulo(date = new Date()): string {
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function getYesterdayDateKeyInSaoPaulo(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKeyInSaoPaulo(yesterday);
}

export function formatDateTimeBr(date = new Date()): string {
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export async function registerDailyAccess(user: UserProfile): Promise<void> {
  const userId = user.id || user.cpf;

  if (!userId) {
    console.warn("[AccessLogs] usuário sem ID, acesso não registrado", user);
    return;
  }

  const dateKey = getDateKeyInSaoPaulo();
  const dateBr = getDateBrInSaoPaulo();
  const now = new Date();
  const docId = `${dateKey}_${userId}`;

  const payload = {
    dateKey,
    dateBr,
    userId,
    name: user.name || "",
    lastAccessAt: now.toISOString(),
    lastAccessAtBr: formatDateTimeBr(now),
  };

  try {
    await setDoc(doc(db, "accessLogs", docId), payload, { merge: true });
  } catch (error) {
    console.error("[AccessLogs] erro ao registrar acesso:", error);
    throw error;
  }
}

export async function getActiveUsersCountByDate(dateKey: string): Promise<number> {
  const q = query(collection(db, "accessLogs"), where("dateKey", "==", dateKey));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function getYesterdayAndTodayActiveUsersCount(): Promise<{
  yesterday: number;
  today: number;
}> {
  const todayDateKey = getDateKeyInSaoPaulo();
  const yesterdayDateKey = getYesterdayDateKeyInSaoPaulo();

  const [todayCount, yesterdayCount] = await Promise.all([
    getActiveUsersCountByDate(todayDateKey),
    getActiveUsersCountByDate(yesterdayDateKey),
  ]);

  return { today: todayCount, yesterday: yesterdayCount };
}
