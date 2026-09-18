import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase";

export type VisitSource = "explorar" | "buscar";

export type ModuleVisit = {
  id: string;
  moduleId: string;
  source: VisitSource;
  age: string | null;
  gender: string | null;
  timestamp: Date | null;
  monthKey: string;
};

function sessionKey(moduleId: string): string {
  return `visited_${moduleId}`;
}

// Registra la primera apertura de un módulo en esta sesión de navegador.
// No se guarda ningún identificador de la familia: es fire-and-forget y
// anónimo. sessionStorage evita contar reentradas al mismo módulo dentro
// de la misma sesión; una nueva sesión (otro día) sí cuenta de nuevo.
export function logModuleVisit(
  moduleId: string,
  source: VisitSource,
  age?: string | null,
  gender?: string | null,
): void {
  if (typeof window === "undefined") return;

  const key = sessionKey(moduleId);
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  const monthKey = new Date().toISOString().slice(0, 7);

  addDoc(collection(db, "module_visits"), {
    moduleId,
    source,
    age: source === "buscar" ? (age ?? null) : null,
    gender: source === "buscar" ? (gender ?? null) : null,
    timestamp: serverTimestamp(),
    monthKey,
  }).catch(() => {
    // Analítica best-effort: si falla el registro no debe afectar la
    // navegación de la familia. Revertimos el flag para reintentar en
    // una futura visita de esta misma sesión.
    sessionStorage.removeItem(key);
  });
}

// Firestore's 'in' soporta máximo 10 valores, más que suficiente para el
// rango de 6-12 meses que usa el dashboard.
export async function getVisitsForRange(months: string[]): Promise<ModuleVisit[]> {
  if (months.length === 0) return [];

  const q = query(collection(db, "module_visits"), where("monthKey", "in", months));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      moduleId: data.moduleId,
      source: data.source,
      age: data.age ?? null,
      gender: data.gender ?? null,
      timestamp: data.timestamp?.toDate?.() ?? null,
      monthKey: data.monthKey,
    } as ModuleVisit;
  });
}
