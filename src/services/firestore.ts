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

export async function getLatestIafUpdate(): Promise<IafReport | null> {
  const snap = await getDoc(doc(db, "iafLatest", "current"));
  if (!snap.exists()) return null;
  return { id: "current", ...snap.data() } as IafReport;
}

export async function getPreviousIafReport(beforeId: string): Promise<IafReport | null> {
  const snapshot = await getDocs(collection(db, "iafReports"));
  if (snapshot.empty) return null;
  const prev = snapshot.docs
    .filter((d) => d.id < beforeId)
    .sort((a, b) => b.id.localeCompare(a.id))[0];
  if (!prev) return null;
  return { id: prev.id, ...prev.data() } as IafReport;
}
