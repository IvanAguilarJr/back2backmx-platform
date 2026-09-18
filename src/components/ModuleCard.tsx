import Link from "next/link";
import Icon from "./Icon";
import type { Module } from "@/lib/types";

// Hash simple y determinístico: mismo id -> mismo tono siempre.
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function coverGradient(id: string): string {
  const hash = hashString(id);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 65% 28%), hsl(${hue2} 70% 16%))`;
}

export const DOT_PATTERN_STYLE = {
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px)",
  backgroundSize: "14px 14px",
};

export function CoverFallback({ id, icon }: { id: string; icon: Module["icon"] }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ backgroundImage: coverGradient(id) }}
    >
      <div className="absolute inset-0" style={DOT_PATTERN_STYLE} />
      <Icon name={icon} className="relative size-12 text-white" />
    </div>
  );
}

export default function ModuleCard({
  module,
  href,
}: {
  module: Module;
  href?: string;
}) {
  return (
    <Link
      href={href ?? `/modulo/${module.id}`}
      className={`group relative block overflow-hidden rounded-[22px] bg-bg transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg ${
        module.priority ? "border-2 border-ink" : "border border-line"
      }`}
    >
      {module.priority && (
        <div className="absolute -right-11 top-5 z-10 w-36 rotate-45 bg-yellow py-1 text-center text-[11px] font-bold text-ink">
          Prioridad alta
        </div>
      )}

      <div className="relative h-[132px] w-full">
        {module.coverImage ? (
          // Portadas vienen de URLs externas arbitrarias que el equipo pega
          // a mano (Imgur, Drive, etc.) — no hay un set fijo de hosts para
          // configurar en next/image, así que se sirven como <img> plano.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={module.coverImage}
            alt={module.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverFallback id={module.id} icon={module.icon} />
        )}
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {module.badge}
        </span>
      </div>

      <div className="p-6">
        <h3 className="font-display text-lg font-bold text-ink">{module.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{module.desc}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {module.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-paper-soft px-3 py-1 text-xs font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="mt-4 inline-block text-sm font-semibold text-ink transition-transform group-hover:translate-x-0.5">
          Ver módulo →
        </span>
      </div>
    </Link>
  );
}
