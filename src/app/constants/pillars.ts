import { ShoppingBag, Smartphone, Leaf, Sliders, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PillarDef = { key: string; name: string; icon: LucideIcon; sourceKeys: string[] };

export const PILLARS: PillarDef[] = [
  { key: "gestao_comercial",        name: "Gestão Comercial",       icon: ShoppingBag, sourceKeys: ["gestao_comercial"] },
  { key: "omni_digital",            name: "Omni & Digital",         icon: Smartphone,  sourceKeys: ["omni_digital"] },
  { key: "esg",                     name: "ESG",                    icon: Leaf,        sourceKeys: ["esg"] },
  { key: "excelencia_operacional",  name: "Excelência Operacional", icon: Sliders,     sourceKeys: ["excelencia_operacional"] },
  {
    key: "gestao_pessoas_financas",
    name: "Gestão de Pes. e Fin.",
    icon: Users,
    sourceKeys: ["gestao_pessoas", "financas"],
  },
];

// Pillar key → display name (inclui chaves legadas para retrocompatibilidade)
export const PILLAR_KEY_MAP: Record<string, string> = {
  gestao_comercial:        "Gestão Comercial",
  omni_digital:            "Omni & Digital",
  esg:                     "ESG",
  excelencia_operacional:  "Excelência Operacional",
  gestao_pessoas_financas: "Gestão de Pes. e Fin.",
  // Legacy — usuários com seleção antiga
  gestao_pessoas:          "Gestão de Pes. e Fin.",
  financas:                "Gestão de Pes. e Fin.",
};

// Display name → pillar key
export const PILLAR_DISPLAY_TO_KEY: Record<string, string> = Object.fromEntries(
  PILLARS.map((p) => [p.name, p.key])
);

// Source key (ind.pillar) → visual pillar key
export const SOURCE_KEY_TO_PILLAR_KEY: Record<string, string> = Object.fromEntries(
  PILLARS.flatMap((p) => p.sourceKeys.map((sk) => [sk, p.key]))
);

export const ALL_PILLAR_NAMES = PILLARS.map((p) => p.name);

// Checa se um indicador (pelo ind.pillar) pertence a um pilar visual
export function indicatorBelongsToPillar(indicatorPillar: string, pillarKey: string): boolean {
  const pillar = PILLARS.find((p) => p.key === pillarKey);
  if (!pillar) return false;
  return pillar.sourceKeys.includes(indicatorPillar);
}

// Normaliza selectedPillars do Firestore (chaves raw, possivelmente legadas) para chaves de pilares visuais
// Retorna todos os pilares como fallback se a lista for vazia ou inválida
export function normalizeSelectedPillars(selectedPillars?: string[]): string[] {
  const validKeys = PILLARS.map((p) => p.key);
  if (!selectedPillars?.length) return validKeys;

  const normalized = [...new Set(
    selectedPillars.map((k) => SOURCE_KEY_TO_PILLAR_KEY[k] ?? k)
  )].filter((k) => validKeys.includes(k));

  return normalized.length > 0 ? normalized : validKeys;
}
