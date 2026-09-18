"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import ChipSelector from "./ChipSelector";
import { createPiece, PIECE_KIND_RENDER_TYPE, updatePiece } from "@/lib/modules";
import { AGE_OPTIONS, GENDER_OPTIONS, PIECE_KIND_OPTIONS } from "@/lib/taxonomy";
import type { Piece, PieceKind } from "@/lib/types";

type PanelState = { label: string; title: string; text: string; items: string[] };

const EMPTY_PANEL: PanelState = { label: "", title: "", text: "", items: [] };

type FormState = {
  kind: PieceKind;
  title: string;
  summary: string;
  age: string[];
  gender: string;
  text: string;
  tip: string;
  videoTitle: string;
  channel: string;
  videoUrl: string;
  items: string[];
  colATitle: string;
  colAItems: string[];
  colBTitle: string;
  colBItems: string[];
  rojo: PanelState;
  amarillo: PanelState;
  verde: PanelState;
};

function emptyForm(): FormState {
  return {
    kind: "articulo",
    title: "",
    summary: "",
    age: [],
    gender: "todos",
    text: "",
    tip: "",
    videoTitle: "",
    channel: "",
    videoUrl: "",
    items: [],
    colATitle: "",
    colAItems: [],
    colBTitle: "",
    colBItems: [],
    rojo: { ...EMPTY_PANEL, label: "Rojo", title: "Rojo" },
    amarillo: { ...EMPTY_PANEL, label: "Amarillo", title: "Amarillo" },
    verde: { ...EMPTY_PANEL, label: "Verde", title: "Verde" },
  };
}

function pieceToForm(piece: Piece): FormState {
  return {
    kind: piece.kind,
    title: piece.title,
    summary: piece.summary,
    age: piece.age,
    gender: piece.gender[0] ?? "todos",
    text: piece.text ?? "",
    tip: piece.tip ?? "",
    videoTitle: piece.videoTitle ?? "",
    channel: piece.channel ?? "",
    videoUrl: piece.videoUrl ?? "",
    items: piece.items ?? [],
    colATitle: piece.colA?.title ?? "",
    colAItems: piece.colA?.items ?? [],
    colBTitle: piece.colB?.title ?? "",
    colBItems: piece.colB?.items ?? [],
    rojo: piece.rojo ?? { ...EMPTY_PANEL, label: "Rojo", title: "Rojo" },
    amarillo: piece.amarillo ?? { ...EMPTY_PANEL, label: "Amarillo", title: "Amarillo" },
    verde: piece.verde ?? { ...EMPTY_PANEL, label: "Verde", title: "Verde" },
  };
}

function nonEmpty(items: string[]): string[] {
  return items.map((i) => i.trim()).filter(Boolean);
}

function buildPieceData(form: FormState, moduleId: string, order: number): Omit<Piece, "id"> {
  const base = {
    moduleId,
    kind: form.kind,
    renderType: PIECE_KIND_RENDER_TYPE[form.kind],
    age: form.age,
    gender: [form.gender],
    title: form.title.trim(),
    summary: form.summary.trim(),
    order,
  };

  switch (form.kind) {
    case "articulo":
      return { ...base, text: form.text, ...(form.tip.trim() ? { tip: form.tip.trim() } : {}) };
    case "video":
      return {
        ...base,
        videoTitle: form.videoTitle.trim(),
        channel: form.channel.trim(),
        videoUrl: form.videoUrl.trim(),
      };
    case "checklist":
      return { ...base, items: nonEmpty(form.items) };
    case "tip":
      return {
        ...base,
        colA: { title: form.colATitle.trim(), items: nonEmpty(form.colAItems) },
        colB: { title: form.colBTitle.trim(), items: nonEmpty(form.colBItems) },
      };
    case "semaforo":
      return {
        ...base,
        rojo: { ...form.rojo, items: nonEmpty(form.rojo.items) },
        amarillo: { ...form.amarillo, items: nonEmpty(form.amarillo.items) },
        verde: { ...form.verde, items: nonEmpty(form.verde.items) },
      };
  }
}

export default function PieceFormModal({
  piece,
  moduleId,
  existingPieces,
  onClose,
  onSaved,
}: {
  piece?: Piece;
  moduleId: string;
  existingPieces: Piece[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!piece;
  const [form, setForm] = useState<FormState>(piece ? pieceToForm(piece) : emptyForm());
  const [saving, setSaving] = useState(false);

  const canSubmit = (() => {
    if (!form.title.trim() || !form.summary.trim()) return false;
    if (form.kind === "checklist") return nonEmpty(form.items).length > 0;
    if (form.kind === "semaforo") {
      return (
        nonEmpty(form.rojo.items).length > 0 &&
        nonEmpty(form.amarillo.items).length > 0 &&
        nonEmpty(form.verde.items).length > 0
      );
    }
    if (form.kind === "video") return form.videoTitle.trim().length > 0;
    return true;
  })();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      if (isEditing && piece) {
        const data = buildPieceData(form, moduleId, piece.order);
        await updatePiece(piece.id, data);
      } else {
        const order = Math.max(0, ...existingPieces.map((p) => p.order)) + 1;
        const data = buildPieceData(form, moduleId, order);
        await createPiece(data);
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-bg p-6"
      >
        <h2 className="font-display text-xl font-bold text-ink">
          {isEditing ? "Editar recurso" : "Nuevo recurso"}
        </h2>

        <Field label="Tipo">
          <ChipSelector
            mode="single"
            options={PIECE_KIND_OPTIONS}
            selected={form.kind}
            onChange={(kind) => setForm((f) => ({ ...f, kind: kind as PieceKind }))}
          />
        </Field>

        <Field label="Título">
          <input
            required
            aria-label="Título"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field label="Resumen (se ve en la tarjeta colapsada)">
          <input
            required
            aria-label="Resumen"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field label="Edad (ninguna seleccionada = todas las edades)">
          <ChipSelector
            mode="multi"
            options={AGE_OPTIONS}
            selected={form.age}
            onChange={(age) => setForm((f) => ({ ...f, age }))}
          />
        </Field>

        <Field label="Género">
          <ChipSelector
            mode="single"
            options={GENDER_OPTIONS}
            selected={form.gender}
            onChange={(gender) => setForm((f) => ({ ...f, gender }))}
          />
        </Field>

        <div className="mt-5 border-t border-line pt-5">
          <KindFields form={form} setForm={setForm} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="rounded-full bg-yellow px-5 py-2.5 font-medium text-ink transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear recurso"}
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

function KindFields({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (updater: (f: FormState) => FormState) => void;
}) {
  switch (form.kind) {
    case "articulo":
      return (
        <>
          <Field label="Contenido (acepta <b> para negritas)">
            <textarea
              required
              aria-label="Contenido"
              rows={6}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Sugerencia práctica (opcional)">
            <textarea
              aria-label="Sugerencia práctica"
              rows={2}
              value={form.tip}
              onChange={(e) => setForm((f) => ({ ...f, tip: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </>
      );

    case "video":
      return (
        <>
          <Field label="Título del video">
            <input
              required
              aria-label="Título del video"
              value={form.videoTitle}
              onChange={(e) => setForm((f) => ({ ...f, videoTitle: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Canal">
            <input
              aria-label="Canal"
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Link de YouTube">
            <input
              aria-label="Link de YouTube"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </>
      );

    case "checklist":
      return (
        <Field label="Puntos">
          <DynamicList
            items={form.items}
            onChange={(items) => setForm((f) => ({ ...f, items }))}
          />
        </Field>
      );

    case "tip":
      return (
        <>
          <div className="rounded-xl border border-line p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Columna A</p>
            <Field label="Título de la columna">
              <input
                aria-label="Título de la columna A"
                value={form.colATitle}
                onChange={(e) => setForm((f) => ({ ...f, colATitle: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Puntos">
              <DynamicList
                items={form.colAItems}
                onChange={(colAItems) => setForm((f) => ({ ...f, colAItems }))}
              />
            </Field>
          </div>
          <div className="mt-4 rounded-xl border border-line p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Columna B</p>
            <Field label="Título de la columna">
              <input
                aria-label="Título de la columna B"
                value={form.colBTitle}
                onChange={(e) => setForm((f) => ({ ...f, colBTitle: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Puntos">
              <DynamicList
                items={form.colBItems}
                onChange={(colBItems) => setForm((f) => ({ ...f, colBItems }))}
              />
            </Field>
          </div>
        </>
      );

    case "semaforo":
      return (
        <>
          <SemaforoPanelFields
            panel={form.rojo}
            onChange={(rojo) => setForm((f) => ({ ...f, rojo }))}
          />
          <SemaforoPanelFields
            panel={form.amarillo}
            onChange={(amarillo) => setForm((f) => ({ ...f, amarillo }))}
          />
          <SemaforoPanelFields
            panel={form.verde}
            onChange={(verde) => setForm((f) => ({ ...f, verde }))}
          />
        </>
      );
  }
}

function SemaforoPanelFields({
  panel,
  onChange,
}: {
  panel: PanelState;
  onChange: (panel: PanelState) => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-line p-3 first:mt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{panel.title || "Panel"}</p>
      <Field label="Etiqueta del botón">
        <input
          aria-label={`Etiqueta del botón (${panel.title || "panel"})`}
          value={panel.label}
          onChange={(e) => onChange({ ...panel, label: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Título del panel">
        <input
          aria-label={`Título del panel (${panel.title || "panel"})`}
          value={panel.title}
          onChange={(e) => onChange({ ...panel, title: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Texto de contexto">
        <textarea
          aria-label={`Texto de contexto (${panel.title || "panel"})`}
          rows={2}
          value={panel.text}
          onChange={(e) => onChange({ ...panel, text: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Ejemplos">
        <DynamicList items={panel.items} onChange={(items) => onChange({ ...panel, items })} />
      </Field>
    </div>
  );
}

function DynamicList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className={`${inputClass} mt-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label="Quitar punto"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink hover:border-ink"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="text-sm font-medium text-ink underline underline-offset-2"
      >
        + Agregar punto
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-paper-soft px-3 py-2 text-ink outline-none focus:border-ink";
