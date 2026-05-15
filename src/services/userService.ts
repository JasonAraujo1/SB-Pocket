import { getUserByCpf, updateUserSelectedPillars } from "./firestore";
import type { UserProfile } from "../app/types/user";

export async function restoreUserSession(cpf: string): Promise<UserProfile | null> {
  try {
    const user = await getUserByCpf(cpf);
    if (!user?.active) return null;
    return user;
  } catch {
    return null;
  }
}

export async function saveSelectedPillars(cpf: string, pillars: string[]): Promise<void> {
  await updateUserSelectedPillars(cpf, pillars);
}
