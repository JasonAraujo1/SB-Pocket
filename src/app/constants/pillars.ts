import { ShoppingBag, Smartphone, Leaf, Sliders, Users, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const PILLAR_KEY_MAP: Record<string, string> = {
  gestao_comercial: "Gestão Comercial",
  omni_digital: "Omni & Digital",
  esg: "ESG",
  excelencia_operacional: "Excelência Operacional",
  gestao_pessoas: "Gestão de Pessoas",
  financas: "Finanças",
};

export const PILLAR_DISPLAY_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(PILLAR_KEY_MAP).map(([k, v]) => [v, k])
);

export const ALL_PILLAR_NAMES = Object.values(PILLAR_KEY_MAP);

export type PillarDef = { key: string; name: string; icon: LucideIcon };

export const PILLARS: PillarDef[] = [
  { key: "gestao_comercial", name: "Gestão Comercial", icon: ShoppingBag },
  { key: "omni_digital", name: "Omni & Digital", icon: Smartphone },
  { key: "esg", name: "ESG", icon: Leaf },
  { key: "excelencia_operacional", name: "Excelência Operacional", icon: Sliders },
  { key: "gestao_pessoas", name: "Gestão de Pessoas", icon: Users },
  { key: "financas", name: "Finanças", icon: DollarSign },
];
