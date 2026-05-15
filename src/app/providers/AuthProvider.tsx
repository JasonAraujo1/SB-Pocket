import { createContext, useEffect, useState, type ReactNode } from "react";
import { validateLogin } from "../../services/authService";
import { restoreUserSession, saveSelectedPillars } from "../../services/userService";
import { PILLAR_KEY_MAP, PILLAR_DISPLAY_TO_KEY, ALL_PILLAR_NAMES } from "../constants/pillars";
import type { UserProfile } from "../types/user";
import type { AuthContextValue } from "../types/auth";

const SESSION_KEY = "sb_pocket_user_cpf";

export const AuthContext = createContext<AuthContextValue | null>(null);

function mapPillarsToDisplay(selectedPillars: string[]): string[] {
  if (!selectedPillars?.length) return ALL_PILLAR_NAMES;
  return selectedPillars.map((k) => PILLAR_KEY_MAP[k] ?? k).filter(Boolean);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [preferredPillars, setPreferredPillars] = useState<string[]>(ALL_PILLAR_NAMES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCpf = localStorage.getItem(SESSION_KEY);
    if (!savedCpf) { setIsLoading(false); return; }

    restoreUserSession(savedCpf)
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          setPreferredPillars(mapPillarsToDisplay(user.selectedPillars));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (cpf: string, password: string): Promise<string | null> => {
    const { user, error } = await validateLogin(cpf, password);
    if (error || !user) return error;
    localStorage.setItem(SESSION_KEY, user.cpf);
    setCurrentUser(user);
    setPreferredPillars(mapPillarsToDisplay(user.selectedPillars));
    return null;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setPreferredPillars(ALL_PILLAR_NAMES);
  };

  const savePillars = async (displayNames: string[]): Promise<void> => {
    if (!currentUser) throw new Error("Usuário não autenticado");
    const keys = displayNames.map((n) => PILLAR_DISPLAY_TO_KEY[n] ?? n).filter(Boolean);
    await saveSelectedPillars(currentUser.cpf, keys);
    setPreferredPillars(displayNames);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        preferredPillars,
        login,
        logout,
        savePillars,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
