export type IafReport = {
  date: string;
  source: string;
  createdAt?: string;
  pillarsSummary?: Record<string, unknown>;
  indicators?: unknown[];
};

export type IafIndicator = {
  idx: string;
  label: string;
  real: string;
  meta: string;
  pct: number;
  points: string;
};
