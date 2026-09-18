"use client";

import { useState, type FormEvent } from "react";
import { createModule, updateModule } from "@/lib/modules";
import { MODULE_ICON_OPTIONS } from "@/lib/taxonomy";
import { CoverFallback } from "./ModuleCard";
import type { IconName, Module } from "@/lib/types";

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(base: string, existingIds: string[]): string {
  if (!existingIds.includes(base)) return base;
  let n = 2;
  while (existingIds.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export default function ModuleFormModal({
  module,
  existingModules,
  onClose,
  onSaved,
}: {
  module?: Module;
  existingModules: Module[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!module;
  const [title, setTitle] = useState(module?.title ?? "");
  const [badge, setBadge] = useState(module?.badge ?? "");
  const [desc, setDesc] = useState(module?.desc ?? "");
  const [tagsText, setTagsText] = useState((module?.tags ?? []).join(", "));
  const [icon, setIcon] = useState<IconName>(module?.icon ?? "shield");
  const [priority, setPriority] = useState(module?.priority ?? false);
  const [coverImage, setCoverImage] = useState(module?.coverImage ?? "");
  const [saving, setSaving] = useState(false);

  const tags = tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const canSubmit =
    title.trim().length > 0 && badge.trim().length > 0 && desc.trim().length > 0 && tags.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const trimmedCover = coverImage.trim();
      if (isEditing && module) {
        await updateModule(module.id, {
          title: title.trim(),
          badge: badge.trim(),
          desc: desc.trim(),
          tags,
          icon,
          priority,
          ...(trimmedCover ? { coverImage: trimmedCover } : {}),
        });
      } else {
        const id = uniqueSlug(
          slugify(title),
          existingModules.map((m) => m.id),
        );
        const order = Math.max(0, ...existingModules.map((m) => m.order)) + 1;
        await createModule(id, {
          title: title.trim(),
          badge: badge.trim(),
          desc: desc.trim(),
          tags,
          icon,
          priority,
          age: [],
          gender: ["todos"],
          order,
          ...(trimmedCover ? { coverImage: trimmedCover } : {}),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] bg-bg p-6"
      >
        <h2 className="font-display text-xl font-bold text-ink">
          {isEditing ? "Editar módulo" : "Nuevo módulo"}
        </h2>

        <label className="mt-5 block text-sm font-medium text-ink">
          Título
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Badge de contexto
          <input
            required
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Descripción
          <textarea
            required
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Tags (separados por coma)
          <input
            required
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="Alta prioridad, Prevención, Protección"
            className={inputClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Ícono
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value as IconName)}
            className={inputClass}
          >
            {MODULE_ICON_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="text-sm font-medium text-ink">URL de imagen de portada (opcional)</p>
          <div className="mt-1 h-32 w-full overflow-hidden rounded-xl border border-line">
            {coverImage.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage.trim()}
                alt="Portada"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <CoverFallback id={module?.id ?? "preview"} icon={icon} />
            )}
          </div>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">
            Pega el link de una imagen ya alojada en otro lugar. Sin esto, se usa un
            degradado generado automáticamente para el módulo.
          </p>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="size-4 rounded border-line"
          />
          Marcar como prioridad alta
        </label>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="rounded-full bg-yellow px-5 py-2.5 font-medium text-ink transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear módulo"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-paper-soft px-3 py-2 text-ink outline-none focus:border-ink";
