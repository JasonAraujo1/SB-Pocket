import { doc, getDoc, collection, getDocs, query, orderBy, limit, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "../app/types/user";
import type { IafReport } from "../app/types/iaf";

export type { UserProfile, IafReport };

export async function getUserByCpf(cpf: string): Promise<UserProfile | null> {
  const cleanCpf = cpf.replace(/\D/g, "");
  const userRef = doc(db, "users", cleanCpf);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return userSnap.data() as UserProfile;
}

export async function updateUserSelectedPillars(cpf: string, selectedPillars: string[]): Promise<void> {
  const cleanCpf = cpf.replace(/\D/g, "");
  const userRef = doc(db, "users", cleanCpf);
  await updateDoc(userRef, { selectedPillars });
}

export async function getReportByDate(date: string): Promise<IafReport | null> {
  const reportRef = doc(db, "iafReports", date);
  const reportSnap = await getDoc(reportRef);
  if (!reportSnap.exists()) return null;
  return reportSnap.data() as IafReport;
}

export async function getLatestIafReport(): Promise<IafReport | null> {
  const reportsRef = collection(db, "iafReports");
  const reportsQuery = query(reportsRef, orderBy("date", "desc"), limit(1));
  const snapshot = await getDocs(reportsQuery);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as IafReport;
}
