import type { UserProfile } from "./user";

export type AuthContextValue = {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  preferredPillars: string[];
  login: (cpf: string, password: string) => Promise<string | null>;
  logout: () => void;
  savePillars: (displayNames: string[]) => Promise<void>;
};
