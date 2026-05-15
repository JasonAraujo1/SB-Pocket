import { getLatestIafReport, getReportByDate } from "./firestore";
import type { IafReport, IafIndicator, IafPillarSummary } from "../app/types/iaf";

function metricNum(raw: number | string | null | undefined): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(",", "."));
    return isNaN(n) ? null : n;
  }
  return null;
}

function buildPillarsSummary(
  indicators: IafIndicator[]
): Record<string, IafPillarSummary> {
  const groups: Record<string, number[]> = {};

  for (const ind of indicators) {
    const key = ind.pillar;
    if (!key) continue;
    const pct = metricNum(ind.percentualAtingido?.raw);
    if (pct === null) continue;
    groups[key] = [...(groups[key] ?? []), pct];
  }

  const summary: Record<string, IafPillarSummary> = {};
  for (const [key, values] of Object.entries(groups)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const status: IafPillarSummary["status"] =
      avg >= 100 ? "up" : avg >= 80 ? "stable" : "down";
    summary[key] = { status, averagePercentual: parseFloat(avg.toFixed(1)) };
  }

  // Pilares sem nenhum percentual ficam como pending
  for (const ind of indicators) {
    if (ind.pillar && !(ind.pillar in summary)) {
      summary[ind.pillar] = { status: "pending_comparison" };
    }
  }

  return summary;
}

function normalizeReport(raw: IafReport): IafReport {
  const indicators = Array.isArray(raw.indicators) ? raw.indicators : [];
  const pillarsSummary =
    raw.pillarsSummary && Object.keys(raw.pillarsSummary).length > 0
      ? raw.pillarsSummary
      : buildPillarsSummary(indicators);

  // Garante que date existe; usa o id do documento como fallback
  const date = raw.date ?? raw.id;

  return { ...raw, date, indicators, pillarsSummary };
}

export async function fetchLatestReport(): Promise<IafReport | null> {
  const raw = await getLatestIafReport();
  if (!raw) return null;
  return normalizeReport(raw);
}

export async function fetchReportByDate(date: string): Promise<IafReport | null> {
  const raw = await getReportByDate(date);
  if (!raw) return null;
  return normalizeReport(raw);
}
