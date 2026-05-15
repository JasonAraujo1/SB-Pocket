import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "../app/types/user";
import type { IafReport } from "../app/types/iaf";

export type { UserProfile, IafReport };

export async function getUserByCpf(cpf: string): Promise<UserProfile | null> {
  const cleanCpf = cpf.replace(/\D/g, "");
  const snap = await getDoc(doc(db, "users", cleanCpf));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserSelectedPillars(cpf: string, selectedPillars: string[]): Promise<void> {
  const cleanCpf = cpf.replace(/\D/g, "");
  await updateDoc(doc(db, "users", cleanCpf), { selectedPillars });
}

export async function getReportByDate(date: string): Promise<IafReport | null> {
  const snap = await getDoc(doc(db, "iafReports", date));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as IafReport;
}

export async function getLatestIafReport(): Promise<IafReport | null> {
  const snapshot = await getDocs(collection(db, "iafReports"));
  if (snapshot.empty) return null;
  // IDs estão no formato YYYY-MM-DD — ordenação lexicográfica é suficiente
  const latest = snapshot.docs.sort((a, b) => b.id.localeCompare(a.id))[0];
  return { id: latest.id, ...latest.data() } as IafReport;
}
