import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "../app/types/user";
import type { IafReport } from "../app/types/iaf";

export type { UserProfile, IafReport };

export async function getUserByCpf(cpf: string): Promise<UserProfile | null> {
  const cleanCpf = cpf.replace(/\D/g, "");
  const snap = await getDoc(doc(db, "users", cleanCpf));
  if (!snap.exists()) return null;
  // doc.id é o CPF confiável com 11 dígitos — sobrescreve o campo data.cpf
  return { id: snap.id, cpf: snap.id, ...snap.data() } as UserProfile;
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

export async function getLatestTwoIafReports(): Promise<{
  current: IafReport;
  previous: IafReport | null;
} | null> {
  const snapshot = await getDocs(collection(db, "iafReports"));
  if (snapshot.empty) return null;

  // IDs no formato YYYY-MM-DD — ordenação lexicográfica é suficiente
  const sorted = snapshot.docs.sort((a, b) => b.id.localeCompare(a.id));
  const current = { id: sorted[0].id, ...sorted[0].data() } as IafReport;
  const previous = sorted[1]
    ? ({ id: sorted[1].id, ...sorted[1].data() } as IafReport)
    : null;

  return { current, previous };
}
