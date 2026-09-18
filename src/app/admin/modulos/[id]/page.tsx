"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import NavLink from "@/components/NavLink";
import { PencilIcon, TrashIcon } from "@/components/ActionIcons";
import { KIND_DEFAULT_ICON } from "@/components/PieceCard";
import PieceFormModal from "@/components/PieceFormModal";
import { deletePiece, getModule, getPiecesForModule } from "@/lib/modules";
import { AGE_LABELS, PIECE_KIND_LABELS } from "@/lib/taxonomy";
import type { Module, Piece } from "@/lib/types";

export default function AdminModulePiecesPage() {
  const params = useParams<{ id: string }>();
  const moduleId = params.id;

  const [module, setModule] = useState<Module | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPiece, setModalPiece] = useState<Piece | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function load() {
    setLoading(true);
    const [mod, ps] = await Promise.all([
      getModule(moduleId),
      getPiecesForModule(moduleId),
    ]);
    setModule(mod);
    setPieces(ps);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  async function handleDelete(piece: Piece) {
    if (!confirm(`¿Eliminar la pieza "${piece.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    await deletePiece(piece.id);
    await load();
  }

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Logo className="h-8" />
          <NavLink href="/admin">← Módulos</NavLink>
        </div>

        {loading ? (
          <p className="mt-8 text-muted">Cargando módulo…</p>
        ) : !module ? (
          <p className="mt-8 text-muted">No se encontró este módulo.</p>
        ) : (
          <>
            <div className="mt-6 flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-yellow">
                <Icon name={module.icon} className="size-7" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {module.badge}
                </span>
                <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
                  {module.title}
                </h1>
                <p className="mt-2 text-muted">{module.desc}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                {pieces.length} pieza{pieces.length === 1 ? "" : "s"} de contenido
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowCreateModal(true)}
                className="rounded-full bg-yellow px-5 py-2.5 font-medium text-ink transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Nuevo recurso
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pieces.length === 0 ? (
                <div className="rounded-[18px] border border-line bg-paper-soft p-10 text-center">
                  <p className="text-ink">Este módulo todavía no tiene piezas de contenido.</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 rounded-full bg-yellow px-5 py-2.5 font-medium text-ink transition-colors hover:bg-yellow-deep"
                  >
                    + Nuevo recurso
                  </button>
                </div>
              ) : (
                pieces.map((piece) => (
                  <PieceRow
                    key={piece.id}
                    piece={piece}
                    onEdit={() => setModalPiece(piece)}
                    onDelete={() => handleDelete(piece)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {module && (showCreateModal || modalPiece) && (
        <PieceFormModal
          piece={modalPiece ?? undefined}
          moduleId={module.id}
          existingPieces={pieces}
          onClose={() => {
            setShowCreateModal(false);
            setModalPiece(null);
          }}
          onSaved={() => {
            setShowCreateModal(false);
            setModalPiece(null);
            load();
          }}
        />
      )}
    </main>
  );
}

function PieceRow({
  piece,
  onEdit,
  onDelete,
}: {
  piece: Piece;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const icon = piece.icon ?? KIND_DEFAULT_ICON[piece.kind];
  const isVideo = piece.kind === "video";

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-bg p-4 sm:flex-row sm:items-center">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          isVideo ? "bg-yellow text-ink" : "bg-ink text-yellow"
        }`}
      >
        <Icon name={icon} className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {PIECE_KIND_LABELS[piece.kind] ?? piece.kind}
        </span>
        <h3 className="font-display text-base font-bold text-ink">{piece.title}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {piece.age.length === 0 ? (
          <span className="rounded-full bg-yellow px-3 py-1 text-xs font-semibold text-ink">
            Todas las edades
          </span>
        ) : (
          piece.age.map((id) => (
            <span
              key={id}
              className="rounded-full border border-line bg-paper-soft px-3 py-1 text-xs font-medium text-ink"
            >
              {AGE_LABELS[id] ?? id}
            </span>
          ))
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar pieza"
          className="flex size-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar pieza"
          className="flex size-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
