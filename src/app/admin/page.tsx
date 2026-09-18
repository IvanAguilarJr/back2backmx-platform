"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  deleteModuleWithPieces,
  getAllModules,
  getPiecesForModule,
} from "@/lib/modules";
import ModuleFormModal from "@/components/ModuleFormModal";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import NavLink from "@/components/NavLink";
import { PencilIcon, TrashIcon } from "@/components/ActionIcons";
import type { Module } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [pieceCounts, setPieceCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [modalModule, setModalModule] = useState<Module | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function loadModules() {
    setLoading(true);
    const mods = await getAllModules();
    setModules(mods);
    const counts = await Promise.all(
      mods.map(async (m) => [m.id, (await getPiecesForModule(m.id)).length] as const),
    );
    setPieceCounts(Object.fromEntries(counts));
    setLoading(false);
  }

  useEffect(() => {
    loadModules();
  }, []);

  async function handleDelete(mod: Module) {
    const count = pieceCounts[mod.id] ?? 0;
    const confirmed = confirm(
      `¿Eliminar el módulo "${mod.title}"? También se borrarán sus ${count} pieza${count === 1 ? "" : "s"} de contenido. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    await deleteModuleWithPieces(mod.id);
    await loadModules();
  }

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Logo className="h-8" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                · Panel
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Panel de contenido
            </h1>
            <p className="mt-1 text-muted">
              Administra los módulos y las piezas que ve cada familia.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <NavLink href="/">Ver como familia</NavLink>
            <NavLink onClick={handleSignOut}>Cerrar sesión</NavLink>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowCreateModal(true)}
            className="rounded-full bg-yellow px-5 py-2.5 font-medium text-ink transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Nuevo módulo
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-muted">Cargando módulos…</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                pieceCount={pieceCounts[mod.id] ?? 0}
                onEdit={() => setModalModule(mod)}
                onDelete={() => handleDelete(mod)}
              />
            ))}
          </div>
        )}
      </div>

      {(showCreateModal || modalModule) && (
        <ModuleFormModal
          module={modalModule ?? undefined}
          existingModules={modules}
          onClose={() => {
            setShowCreateModal(false);
            setModalModule(null);
          }}
          onSaved={() => {
            setShowCreateModal(false);
            setModalModule(null);
            loadModules();
          }}
        />
      )}
    </main>
  );
}

function ModuleCard({
  module,
  pieceCount,
  onEdit,
  onDelete,
}: {
  module: Module;
  pieceCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] p-6 ${
        module.priority
          ? "border-2 border-ink bg-gradient-to-br from-bg to-paper-soft"
          : "border border-line bg-bg"
      }`}
    >
      {module.priority && (
        <div className="absolute -right-11 top-5 w-36 rotate-45 bg-yellow py-1 text-center text-[11px] font-bold text-ink">
          Prioridad alta
        </div>
      )}

      <span className="flex size-11 items-center justify-center rounded-full bg-paper-soft text-ink">
        <Icon name={module.icon} className="size-5" />
      </span>
      <span className="mt-3 inline-block rounded-full bg-yellow px-3 py-1 text-xs font-semibold text-ink">
        {module.badge}
      </span>
      <h2 className="mt-3 font-display text-lg font-bold text-ink">{module.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{module.desc}</p>
      <p className="mt-3 text-xs font-medium text-muted">
        {pieceCount} pieza{pieceCount === 1 ? "" : "s"} de contenido
      </p>

      <Link
        href={`/admin/modulos/${module.id}`}
        className="mt-4 block rounded-full bg-ink px-4 py-2.5 text-center text-sm font-medium text-bg transition-colors hover:bg-gray-deep"
      >
        Administrar piezas
      </Link>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar módulo"
          className="flex size-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar módulo"
          className="flex size-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

