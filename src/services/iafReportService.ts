import { getLatestIafReport, getReportByDate } from "./firestore";
import type { IafReport } from "../app/types/iaf";

export async function fetchLatestReport(): Promise<IafReport | null> {
  return getLatestIafReport();
}

export async function fetchReportByDate(date: string): Promise<IafReport | null> {
  return getReportByDate(date);
}
