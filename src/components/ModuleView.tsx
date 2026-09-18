"use client";

import { useState } from "react";
import Link from "next/link";
import ChipSelector from "./ChipSelector";
import PieceCard from "./PieceCard";
import { AGE_LABELS } from "@/lib/taxonomy";
import type { Module, Piece } from "@/lib/types";

const LAYOUT_OPTIONS = [
  { id: "list", label: "Listado" },
  { id: "table", label: "Tabla" },
];

export default function ModuleView({
  module,
  pieces,
  totalPieces,
  age,
}: {
  module: Module;
  pieces: Piece[];
  totalPieces: number;
  age: string | null;
}) {
  const [layout, setLayout] = useState<"list" | "table">("list");
  const hiddenByAge = totalPieces - pieces.length;

  return (
    <div>
      {age ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper-soft p-4">
          <p className="text-sm text-ink">
            Mostrando contenido para:{" "}
            <span className="font-semibold">{AGE_LABELS[age] ?? age}</span>
            {hiddenByAge > 0 && (
              <span className="text-muted">
                {" "}
                · {hiddenByAge} pieza{hiddenByAge === 1 ? "" : "s"} más para
                otras edades
              </span>
            )}
          </p>
          <Link
            href={`/modulo/${module.id}`}
            className="text-sm font-medium text-ink underline underline-offset-2 hover:text-gray-deep"
          >
            Ver todo sin filtrar
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Viendo todas las piezas, sin filtrar por edad.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <ChipSelector
          mode="single"
          options={LAYOUT_OPTIONS}
          selected={layout}
          onChange={(id) => setLayout(id as "list" | "table")}
        />
      </div>

      <div
        className={`mt-4 ${
          layout === "list"
            ? "space-y-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {pieces.map((piece) => (
          <PieceCard key={piece.id} piece={piece} layout={layout} />
        ))}
      </div>

      {pieces.length === 0 && (
        <p className="mt-6 text-center text-muted">
          No hay piezas para esta edad en este módulo todavía.
        </p>
      )}
    </div>
  );
}
