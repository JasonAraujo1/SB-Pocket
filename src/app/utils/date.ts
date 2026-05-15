type FirestoreTimestamp = { toDate(): Date };

function parseToDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof (value as FirestoreTimestamp).toDate === "function") {
    return (value as FirestoreTimestamp).toDate();
  }
  return null;
}

export function formatDate(value: unknown): string {
  const d = parseToDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatTime(value: unknown): string {
  const d = parseToDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Usa os campos pré-formatados do Firebase; converte YYYY-MM-DD ou id como fallback
export function formatReportDate(report: { id: string; reportDateBr?: string; reportDate?: string; date?: string }): string {
  if (report.reportDateBr) return report.reportDateBr;
  const raw = report.reportDate ?? report.date ?? report.id;
  if (!raw) return "—";
  const parts = String(raw).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return String(raw);
}

export function formatReportTime(report: { executedAtBr?: string; createdAtBr?: string; debugUpdatedAtBr?: string }): string {
  return report.executedAtBr ?? report.createdAtBr ?? report.debugUpdatedAtBr ?? "—";
}
