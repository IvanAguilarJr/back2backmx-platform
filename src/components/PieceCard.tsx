"use client";

import { useState } from "react";
import Icon from "./Icon";
import { PIECE_KIND_LABELS } from "@/lib/taxonomy";
import type { IconName, Piece } from "@/lib/types";

export const KIND_DEFAULT_ICON: Record<Piece["kind"], IconName> = {
  articulo: "doc",
  video: "play",
  tip: "bulb",
  checklist: "checkcirc",
  semaforo: "traffic",
};

export default function PieceCard({
  piece,
  layout,
}: {
  piece: Piece;
  layout: "list" | "table";
}) {
  const [open, setOpen] = useState(false);
  const icon = piece.icon ?? KIND_DEFAULT_ICON[piece.kind];

  return (
    <div className="rounded-[18px] border border-line bg-bg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper-soft text-ink">
          <Icon name={icon} className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-yellow px-2.5 py-0.5 text-[11px] font-semibold text-ink">
            {PIECE_KIND_LABELS[piece.kind] ?? piece.kind}
          </span>
          <span className="mt-1.5 block font-display text-base font-bold text-ink">
            {piece.title}
          </span>
          <span className="mt-0.5 block text-sm text-muted">
            {piece.summary}
          </span>
        </span>
        <span
          className={`mt-1 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-5 pt-4">
          <PieceBody piece={piece} layout={layout} />
        </div>
      )}
    </div>
  );
}

function PieceBody({ piece, layout }: { piece: Piece; layout: "list" | "table" }) {
  switch (piece.renderType) {
    case "text":
      return (
        <div>
          {piece.text && (
            <p
              className="text-sm leading-relaxed text-ink"
              dangerouslySetInnerHTML={{ __html: piece.text }}
            />
          )}
          {piece.tip && (
            <p className="mt-4 rounded-xl bg-paper-soft p-4 text-sm text-ink">
              <span className="font-semibold text-ink">Sugerencia práctica: </span>
              {piece.tip}
            </p>
          )}
        </div>
      );

    case "checklist":
      return (
        <ul className="space-y-2">
          {(piece.items ?? []).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink">
              <Icon name="checkcirc" className="mt-0.5 size-4 shrink-0 text-ink" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "semaforo":
      return <SemaforoBody piece={piece} />;

    case "signals":
      return (
        <div>
          {piece.text && <p className="text-sm leading-relaxed text-ink">{piece.text}</p>}
          <div
            className={`mt-4 grid gap-4 ${layout === "list" ? "sm:grid-cols-2" : "grid-cols-1"}`}
          >
            {piece.groupA && <ChipGroup group={piece.groupA} />}
            {piece.groupB && <ChipGroup group={piece.groupB} />}
          </div>
        </div>
      );

    case "actionLists":
      return (
        <div
          className={`grid gap-6 ${layout === "list" ? "sm:grid-cols-2" : "grid-cols-1"}`}
        >
          {piece.colA && <ActionColumn column={piece.colA} />}
          {piece.colB && <ActionColumn column={piece.colB} />}
        </div>
      );

    case "video":
      return <VideoBody piece={piece} />;

    default:
      return null;
  }
}

function ChipGroup({ group }: { group: { label: string; tags: string[] } }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {group.label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {group.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-paper-soft px-3 py-1 text-xs font-medium text-ink"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActionColumn({ column }: { column: { title: string; items: string[] } }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{column.title}</p>
      <ul className="mt-2 space-y-1.5">
        {column.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SEMAFORO_COLORS = [
  { key: "rojo", dot: "bg-[#D64545]" },
  { key: "amarillo", dot: "bg-yellow" },
  { key: "verde", dot: "bg-[#3F8F5F]" },
] as const;

function SemaforoBody({ piece }: { piece: Piece }) {
  const panels = {
    rojo: piece.rojo,
    amarillo: piece.amarillo,
    verde: piece.verde,
  };
  const available = SEMAFORO_COLORS.filter((c) => panels[c.key]);
  const [selected, setSelected] = useState(available[0]?.key ?? "rojo");
  const panel = panels[selected];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {available.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setSelected(c.key)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected === c.key
                ? "border-ink bg-ink text-bg"
                : "border-line bg-bg text-ink hover:border-ink/40"
            }`}
          >
            <span className={`size-2.5 rounded-full ${c.dot}`} />
            {panels[c.key]?.label ?? c.key}
          </button>
        ))}
      </div>

      {panel && (
        <div className="mt-4 rounded-xl bg-paper-soft p-4">
          <p className="font-display text-sm font-bold text-ink">{panel.title}</p>
          <p className="mt-1.5 text-sm text-ink">{panel.text}</p>
          <ul className="mt-3 space-y-1.5">
            {panel.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VideoBody({ piece }: { piece: Piece }) {
  const hasRealUrl = !!piece.videoUrl && /^https?:\/\//.test(piece.videoUrl);
  return (
    <div>
      {piece.videoTitle && (
        <p className="font-display text-sm font-bold text-ink">{piece.videoTitle}</p>
      )}
      {piece.channel && <p className="mt-1 text-sm text-muted">{piece.channel}</p>}
      {hasRealUrl ? (
        <a
          href={piece.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-gray-deep"
        >
          <Icon name="play" className="size-4" />
          Ver video
        </a>
      ) : (
        <p className="mt-3 rounded-xl bg-paper-soft p-4 text-sm text-muted">
          {piece.videoUrl || "Todavía no hay link de video para esta pieza."}
        </p>
      )}
    </div>
  );
}
