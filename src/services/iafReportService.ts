import { getLatestIafUpdate, getPreviousIafReport, getReportByDate } from "./firestore";
import type { IafReport, IafIndicator, IafPillarSummary } from "../app/types/iaf";
import { SOURCE_KEY_TO_PILLAR_KEY, PILLARS } from "../app/constants/pillars";

// ── Utilitários ──────────────────────────────────────────────────────────────

function metricNum(raw: number | string | null | undefined): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(",", "."));
    return isNaN(n) ? null : n;
  }
  return null;
}

function avgByPillar(indicators: IafIndicator[]): Record<string, number> {
  const groups: Record<string, number[]> = {};
  for (const ind of indicators) {
    if (!ind.pillar) continue;
    const pct = metricNum(ind.percentualAtingido?.raw);
    if (pct === null) continue;
    // Mapeia source key (gestao_pessoas/financas) → pillar key visual (gestao_pessoas_financas)
    const pillarKey = SOURCE_KEY_TO_PILLAR_KEY[ind.pillar] ?? ind.pillar;
    groups[pillarKey] = [...(groups[pillarKey] ?? []), pct];
  }
  return Object.fromEntries(
    Object.entries(groups).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length])
  );
}

// Converte qualquer valor de sourceReportId para string "YYYY-MM-DD"
function resolveSourceId(latest: IafReport): string | null {
  const sid = latest.sourceReportId as unknown;

  // Caso 1: string YYYY-MM-DD
  if (typeof sid === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sid)) return sid;

  // Caso 2: Firestore Timestamp com .toDate()
  if (sid && typeof (sid as { toDate?: unknown }).toDate === "function") {
    const d = (sid as { toDate(): Date }).toDate();
    return d.toISOString().slice(0, 10);
  }

  // Caso 3: reportDate como fallback
  if (latest.reportDate && /^\d{4}-\d{2}-\d{2}$/.test(latest.reportDate)) {
    return latest.reportDate;
  }

  // Caso 4: reportDateBr "DD/MM/YYYY" → "YYYY-MM-DD"
  if (latest.reportDateBr) {
    const parts = latest.reportDateBr.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return null;
}

// ── Geração do resumo de comparação ──────────────────────────────────────────

function formatVariation(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const rounded = parseFloat(value.toFixed(1));
  if (rounded > 0) return `+${rounded.toFixed(1)}%`;
  if (rounded < 0) return `${rounded.toFixed(1)}%`;
  return "0.0%";
}

const STATUS_MESSAGES: Record<IafPillarSummary["status"], string> = {
  up: "Resultado alcançado se aproximou da meta",
  down: "Resultado alcançado se distanciou da meta",
  stable: "Resultado alcançado manteve-se estável",
  pending_comparison: "Sem relatório anterior para comparação",
};

function buildComparisonSummary(
  current: IafIndicator[],
  previous: IafIndicator[] | null
): Record<string, IafPillarSummary> {
  const currentAvgs = avgByPillar(current);
  const previousAvgs = previous ? avgByPillar(previous) : null;
  const summary: Record<string, IafPillarSummary> = {};

  for (const [key, currentAvg] of Object.entries(currentAvgs)) {
    const prevAvg = previousAvgs?.[key] ?? null;

    if (prevAvg === null) {
      summary[key] = {
        status: "pending_comparison",
        averagePercentual: parseFloat(currentAvg.toFixed(1)),
        currentValue: parseFloat(currentAvg.toFixed(1)),
        previousValue: null,
        variation: null,
        variationLabel: "",
        message: STATUS_MESSAGES.pending_comparison,
      };
    } else {
      const variation = parseFloat((currentAvg - prevAvg).toFixed(1));
      const status: IafPillarSummary["status"] =
        variation > 0 ? "up" : variation < 0 ? "down" : "stable";
      summary[key] = {
        status,
        averagePercentual: parseFloat(currentAvg.toFixed(1)),
        currentValue: parseFloat(currentAvg.toFixed(1)),
        previousValue: parseFloat(prevAvg.toFixed(1)),
        variation,
        variationLabel: formatVariation(variation),
        message: STATUS_MESSAGES[status],
      };
    }
  }

  // Pilares com indicadores mas sem dados numéricos de percentual
  for (const pillar of PILLARS) {
    if (pillar.key in summary) continue;
    const hasIndicator = current.some((ind) => pillar.sourceKeys.includes(ind.pillar));
    if (hasIndicator) {
      summary[pillar.key] = {
        status: "pending_comparison",
        message: STATUS_MESSAGES.pending_comparison,
      };
    }
  }

  return summary;
}

// ── Funções públicas ──────────────────────────────────────────────────────────

export async function fetchLatestReport(): Promise<IafReport | null> {
  // 1. Referência da última atualização
  const latest = await getLatestIafUpdate();
  if (!latest) return null;
  console.log("[IAF] latest:", latest);

  // 2. Resolver o ID do relatório atual em iafReports
  const sourceId = resolveSourceId(latest);
  console.log("[IAF] sourceReportId:", sourceId);

  if (!sourceId) {
    // Sem sourceReportId — usa indicators de iafLatest sem comparação
    const indicators = Array.isArray(latest.indicators) ? latest.indicators : [];
    return { ...latest, indicators, pillarsSummary: buildComparisonSummary(indicators, null) };
  }

  // 3. Buscar currentReport em iafReports/{sourceId}
  const currentReport = await getReportByDate(sourceId);
  console.log("[IAF] currentReportId:", currentReport?.id ?? "não encontrado");

  // 4. Buscar previousReport: primeiro doc de iafReports com ID < sourceId
  const previousReport = await getPreviousIafReport(sourceId);
  console.log("[IAF] previousReportId:", previousReport?.id ?? "nenhum");

  // 5. Montar indicadores para comparação
  const currentIndicators =
    currentReport && Array.isArray(currentReport.indicators)
      ? currentReport.indicators
      : Array.isArray(latest.indicators) ? latest.indicators : [];

  const previousIndicators =
    previousReport && Array.isArray(previousReport.indicators)
      ? previousReport.indicators
      : null;

  // 6. Calcular comparação
  const comparisonSummary = buildComparisonSummary(currentIndicators, previousIndicators);
  console.log("[IAF] comparisonSummary:", comparisonSummary);

  return {
    ...latest,
    // Dados para exibição: usa iafLatest/current (mais atualizado)
    indicators: Array.isArray(latest.indicators) ? latest.indicators : currentIndicators,
    pillarsSummary: comparisonSummary,
  };
}

export async function fetchReportByDate(date: string): Promise<IafReport | null> {
  const raw = await getReportByDate(date);
  if (!raw) return null;
  const indicators = Array.isArray(raw.indicators) ? raw.indicators : [];
  return { ...raw, indicators, pillarsSummary: buildComparisonSummary(indicators, null) };
}
