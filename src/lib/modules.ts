import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Piece, PieceKind, RenderType, Module } from "./types";

// El kind es lo único que el admin elige en el form; el renderType se
// infiere de aquí. La única excepción es 'signals' (variante de
// 'articulo'), que solo se alcanza editando renderType a mano en una
// pieza existente — no hay entrada para crearla desde este mapa.
export const PIECE_KIND_RENDER_TYPE: Record<PieceKind, RenderType> = {
  articulo: "text",
  video: "video",
  tip: "actionLists",
  checklist: "checklist",
  semaforo: "semaforo",
};

export async function getAllModules(): Promise<Module[]> {
  const snapshot = await getDocs(collection(db, "modules"));
  const modules = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Module);
  return modules.sort((a, b) => a.order - b.order);
}

export async function getModule(id: string): Promise<Module | null> {
  const snap = await getDoc(doc(db, "modules", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Module;
}

export async function createModule(id: string, data: Omit<Module, "id">) {
  return setDoc(doc(db, "modules", id), data);
}

export async function updateModule(id: string, data: Partial<Omit<Module, "id">>) {
  return updateDoc(doc(db, "modules", id), data);
}

// Borra el módulo y todas sus piezas en un solo batch atómico.
export async function deleteModuleWithPieces(moduleId: string) {
  const q = query(collection(db, "pieces"), where("moduleId", "==", moduleId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "modules", moduleId));
  await batch.commit();
}

export async function getPiecesForModule(moduleId: string): Promise<Piece[]> {
  const q = query(collection(db, "pieces"), where("moduleId", "==", moduleId));
  const snapshot = await getDocs(q);
  const pieces = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Piece);
  return pieces.sort((a, b) => a.order - b.order);
}

export async function createPiece(data: Omit<Piece, "id">) {
  return addDoc(collection(db, "pieces"), data);
}

export async function updatePiece(id: string, data: Partial<Piece>) {
  return updateDoc(doc(db, "pieces", id), data);
}

export async function deletePiece(id: string) {
  return deleteDoc(doc(db, "pieces", id));
}

export function filterPiecesForAge(pieces: Piece[], age: string): Piece[] {
  return pieces.filter((p) => p.age.length === 0 || p.age.includes(age));
}
