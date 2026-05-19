export type PillarKey =
  | "gestao_comercial"
  | "omni_digital"
  | "esg"
  | "excelencia_operacional"
  | "gestao_pessoas"
  | "financas";

export type IafMetric = {
  tipo: string;
  raw: number | string | null;
  formatado: string;
};

export type IafIndicator = {
  code: string;
  title: string;
  pillar: string;
  indicador?: string;
  link?: string;
  habilitador?: string;
  realizado: IafMetric;
  pontosAtingidos: IafMetric;
  percentualAtingido: IafMetric;
  metaPontos: IafMetric;
  metaValor: IafMetric;
  faltaMetaPontos: IafMetric;
  faltaMetaPercentual: IafMetric;
};

export type IafPillarSummary = {
  status: "pending_comparison" | "up" | "down" | "stable";
  averagePercentual?: number | null;
  currentValue?: number | null;
  previousValue?: number | null;
  variation?: number | null;
  variationLabel?: string;
  message?: string;
};

export type IafRankingSummary = {
  points: { formatado: string; raw?: number | string | null };
  percentage: { formatado: string; raw?: number | string | null };
  rating: string;
};

export type IafPillarCard = {
  key: string;
  title: string;
  achievement: { formatado: string };
  untilGoal: { formatado: string };
};

type FirestoreTimestamp = { toDate(): Date; seconds: number };

export type IafReport = {
  id: string;
  date?: string;
  reportDate?: string;
  reportDateBr?: string;
  // campos de iafLatest/current
  updatedAt?: string | FirestoreTimestamp;
  updatedAtBr?: string;
  sourceReportId?: string | FirestoreTimestamp;
  sourceReportKey?: string;
  // campos legados de iafReports
  createdAtBr?: string;
  executedAtBr?: string;
  debugUpdatedAtBr?: string;
  debugRunId?: string;
  source?: string;
  page?: string;
  endpoint?: string;
  createdAt?: string | FirestoreTimestamp;
  executedAt?: string | FirestoreTimestamp;
  indicators: IafIndicator[];
  pillarsSummary: Record<string, IafPillarSummary>;
  rankingSummary?: IafRankingSummary;
  previousRankingSummary?: IafRankingSummary;
  pillarsCards?: IafPillarCard[];
};
