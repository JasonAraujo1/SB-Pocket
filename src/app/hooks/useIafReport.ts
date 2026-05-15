import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { fetchLatestReport } from "../../services/iafReportService";
import type { IafReport } from "../types/iaf";

export function useIafReport() {
  const { isAuthenticated } = useAuth();
  const [report, setReport] = useState<IafReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestReport();
      setReport(data);
    } catch {
      setError("Erro ao carregar relatório. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  return { report, loading, error, refetch: load };
}
