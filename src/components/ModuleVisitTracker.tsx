"use client";

import { useEffect } from "react";
import { logModuleVisit, type VisitSource } from "@/lib/analytics";

// Componente invisible: dispara el registro de analítica al montar la
// página de módulo (que es un server component y no puede tocar
// sessionStorage directamente).
export default function ModuleVisitTracker({
  moduleId,
  source,
  age,
  gender,
}: {
  moduleId: string;
  source: VisitSource;
  age?: string | null;
  gender?: string | null;
}) {
  useEffect(() => {
    logModuleVisit(moduleId, source, age, gender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, source, age, gender]);

  return null;
}
