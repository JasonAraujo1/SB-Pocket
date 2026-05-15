export type UserProfile = {
  id: string;   // doc.id — CPF com 11 dígitos, fonte confiável
  cpf: string;
  name: string;
  active: boolean;
  password?: string;
  selectedPillars: string[];
};
