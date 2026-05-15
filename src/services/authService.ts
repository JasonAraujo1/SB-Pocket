import { getUserByCpf } from "./firestore";
import type { UserProfile } from "../app/types/user";

export async function validateLogin(
  cpf: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const cleanCpf = cpf.replace(/\D/g, "");
  try {
    const user = await getUserByCpf(cleanCpf);
    if (!user) return { user: null, error: "Usuário não encontrado" };
    if (!user.active) return { user: null, error: "Usuário inativo" };
    if (user.password !== password) return { user: null, error: "Senha incorreta" };
    return { user, error: null };
  } catch {
    console.error("[Auth] erro ao validar login");
    return { user: null, error: "Erro ao conectar. Tente novamente." };
  }
}
