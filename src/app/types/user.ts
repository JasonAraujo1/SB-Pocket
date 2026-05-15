export type UserProfile = {
  cpf: string;
  name: string;
  active: boolean;
  password?: string;
  selectedPillars: string[];
};
