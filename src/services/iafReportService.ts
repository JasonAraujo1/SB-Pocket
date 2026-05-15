import { getLatestTwoIafReports, getReportByDate } from "./firestore";
import type { IafReport, IafIndicator, IafPillarSummary } from "../app/types/iaf";

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
    const key = ind.pillar;
    if (!key) continue;
    const pct = metricNum(ind.percentualAtingido?.raw);
    if (pct === null) continue;
    groups[key] = [...(groups[key] ?? []), pct];
  }
  return Object.fromEntries(
    Object.entries(groups).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length])
  );
}

function buildPillarsSummary(
  current: IafIndicator[],
  previous: IafIndicator[] | null
): Record<string, IafPillarSummary> {
  const currentAvgs = avgByPillar(current);
  const previousAvgs = previous ? avgByPillar(previous) : null;
  const summary: Record<string, IafPillarSummary> = {};

  // Pilares com dados numéricos
  for (const [key, currentAvg] of Object.entries(currentAvgs)) {
    const prevAvg = previousAvgs?.[key] ?? null;

    if (prevAvg === null) {
      summary[key] = {
        status: "pending_comparison",
        averagePercentual: parseFloat(currentAvg.toFixed(1)),
        message: "Sem relatório anterior para comparação",
      };
    } else {
      const diff = currentAvg - prevAvg;
      const status: IafPillarSummary["status"] =
        diff > 1 ? "up" : diff < -1 ? "down" : "stable";
      summary[key] = {
        status,
        averagePercentual: parseFloat(currentAvg.toFixed(1)),
      };
    }
  }

  // Pilares sem percentual ficam como pending
  for (const ind of current) {
    if (ind.pillar && !(ind.pillar in summary)) {
      summary[ind.pillar] = {
        status: "pending_comparison",
        message: "Sem relatório anterior para comparação",
      };
    }
  }

  return summary;
}

function normalizeReport(
  raw: IafReport,
  previousRaw: IafReport | null
): IafReport {
  const indicators = Array.isArray(raw.indicators) ? raw.indicators : [];
  const previousIndicators =
    previousRaw && Array.isArray(previousRaw.indicators)
      ? previousRaw.indicators
      : null;

  // Prefere pillarsSummary já calculado pelo Firebase; constrói se ausente ou vazio
  const pillarsSummary =
    raw.pillarsSummary && Object.keys(raw.pillarsSummary).length > 0
      ? raw.pillarsSummary
      : buildPillarsSummary(indicators, previousIndicators);

  const date = raw.date ?? raw.id;
  return { ...raw, date, indicators, pillarsSummary };
}

export async function fetchLatestReport(): Promise<IafReport | null> {
  const result = await getLatestTwoIafReports();
  if (!result) return null;
  return normalizeReport(result.current, result.previous);
}

export async function fetchReportByDate(date: string): Promise<IafReport | null> {
  const raw = await getReportByDate(date);
  if (!raw) return null;
  return normalizeReport(raw, null);
}
