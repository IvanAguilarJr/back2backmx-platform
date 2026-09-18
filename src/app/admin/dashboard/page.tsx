"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllModules } from "@/lib/modules";
import { getVisitsForRange, type ModuleVisit } from "@/lib/analytics";
import { AGE_OPTIONS, GENDER_LABELS, GENDER_OPTIONS } from "@/lib/taxonomy";
import AdminTabs from "@/components/AdminTabs";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import NavLink from "@/components/NavLink";
import type { Module } from "@/lib/types";

const MONTHS_BACK = 6;

// Etiquetas cortas para las mini-barras de edad (5-8, 9-12, 13-15, 16-19),
// a diferencia de AGE_LABELS que usa frases largas ("5 a 8 años") pensadas
// para texto de cara a las familias, no para una barra angosta.
const AGE_SHORT_LABELS = Object.fromEntries(AGE_OPTIONS.map((o) => [o.id, o.id]));

type MonthInfo = { key: string; label: string };
type MonthFilter = "all" | string;

function getLastMonths(n: number): MonthInfo[] {
  const now = new Date();
  const months: MonthInfo[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const raw = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    months.push({ key, label: raw.charAt(0).toUpperCase() + raw.slice(1) });
  }
  return months;
}

export default function DashboardPage() {
  const router = useRouter();
  const months = useMemo(() => getLastMonths(MONTHS_BACK), []);
  const monthKeys = useMemo(() => months.map((m) => m.key), [months]);

  const [modules, setModules] = useState<Module[]>([]);
  const [visits, setVisits] = useState<ModuleVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getAllModules(), getVisitsForRange(monthKeys)]).then(([mods, vis]) => {
      if (cancelled) return;
      setModules(mods);
      setVisits(vis);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // monthKeys se recalcula solo cuando cambia el mes actual del sistema
    // (prácticamente nunca durante la vida de la pestaña), así que es
    // seguro usarlo como dependencia sin recrear el fetch en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKeys.join(",")]);

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  const moduleById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);

  const periodVisits = useMemo(
    () =>
      selectedMonth === "all" ? visits : visits.filter((v) => v.monthKey === selectedMonth),
    [visits, selectedMonth],
  );

  // Totales por mes: siempre sobre el rango completo, para la tendencia.
  const monthlyTotals = useMemo(() => {
    const counts = new Map(monthKeys.map((k) => [k, 0]));
    for (const v of visits) counts.set(v.monthKey, (counts.get(v.monthKey) ?? 0) + 1);
    return months.map((m) => ({ ...m, count: counts.get(m.key) ?? 0 }));
  }, [visits, months, monthKeys]);

  const maxMonthly = Math.max(1, ...monthlyTotals.map((m) => m.count));

  const busiestMonth = useMemo(() => {
    if (!monthlyTotals.some((m) => m.count > 0)) return null;
    return monthlyTotals.reduce((max, m) => (m.count > max.count ? m : max), monthlyTotals[0]);
  }, [monthlyTotals]);

  // Ranking de módulos para el periodo seleccionado en el dropdown.
  const ranking = useMemo(() => {
    const byModule = new Map<string, ModuleVisit[]>();
    for (const v of periodVisits) {
      const list = byModule.get(v.moduleId) ?? [];
      list.push(v);
      byModule.set(v.moduleId, list);
    }
    return Array.from(byModule.entries())
      .map(([moduleId, vs]) => {
        const ageCounts = Object.fromEntries(AGE_OPTIONS.map((o) => [o.id, 0])) as Record<
          string,
          number
        >;
        const genderCounts = Object.fromEntries(
          GENDER_OPTIONS.map((o) => [o.id, 0]),
        ) as Record<string, number>;
        for (const v of vs) {
          if (v.source !== "buscar") continue;
          if (v.age && v.age in ageCounts) ageCounts[v.age] += 1;
          if (v.gender && v.gender in genderCounts) genderCounts[v.gender] += 1;
        }
        return {
          moduleId,
          module: moduleById.get(moduleId) ?? null,
          total: vs.length,
          ageCounts,
          genderCounts,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [periodVisits, moduleById]);

  const mostVisited = ranking[0] ?? null;

  const demographicShare = useMemo(() => {
    const total = periodVisits.length;
    if (total === 0) return 0;
    const buscar = periodVisits.filter((v) => v.source === "buscar").length;
    return Math.round((buscar / total) * 100);
  }, [periodVisits]);

  // Heatmap módulo × mes: siempre sobre el rango completo de 6 meses.
  const heatmap = useMemo(() => {
    const byModule = new Map<string, Map<string, number>>();
    for (const v of visits) {
      const monthMap = byModule.get(v.moduleId) ?? new Map(monthKeys.map((k) => [k, 0]));
      monthMap.set(v.monthKey, (monthMap.get(v.monthKey) ?? 0) + 1);
      byModule.set(v.moduleId, monthMap);
    }
    const rows = Array.from(byModule.entries())
      .map(([moduleId, monthMap]) => {
        const cells = monthKeys.map((k) => monthMap.get(k) ?? 0);
        return {
          moduleId,
          module: moduleById.get(moduleId) ?? null,
          cells,
          total: cells.reduce((a, b) => a + b, 0),
        };
      })
      .sort((a, b) => b.total - a.total);
    const max = rows.reduce((m, r) => Math.max(m, ...r.cells), 0);
    return { rows, max };
  }, [visits, monthKeys, moduleById]);

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Logo className="h-8" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                · Panel
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Dashboard de analítica
            </h1>
            <p className="mt-1 text-muted">
              Qué módulos visitan más las familias, con qué edad y género, y
              cómo varía por mes.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <NavLink href="/">Ver como familia</NavLink>
            <NavLink onClick={handleSignOut}>Cerrar sesión</NavLink>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <AdminTabs />

          <label className="inline-flex items-center gap-2 text-sm">
            <span className="font-medium text-muted">Periodo</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-yellow"
            >
              <option value="all">Todo el periodo (6 meses)</option>
              {[...months].reverse().map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-8 text-muted">Cargando…</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Visitas totales" value={String(periodVisits.length)} />
              <StatCard
                label="Módulo más visitado"
                value={mostVisited?.module?.title ?? "Sin datos aún"}
                sub={mostVisited ? `${mostVisited.total} visita${mostVisited.total === 1 ? "" : "s"}` : undefined}
              />
              <StatCard
                label="Mes con más actividad"
                value={busiestMonth?.label ?? "Sin datos aún"}
                sub={busiestMonth ? `${busiestMonth.count} visita${busiestMonth.count === 1 ? "" : "s"}` : undefined}
              />
              <StatCard
                label="Con dato demográfico"
                value={`${demographicShare}%`}
                sub="visitas desde 'Buscar'"
              />
            </div>

            <section className="mt-10">
              <h2 className="font-display text-lg font-bold text-ink">
                Visitas totales por mes
              </h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-paper-soft p-4">
                <div className="flex h-48 items-end gap-3">
                  {monthlyTotals.map((m) => {
                    const heightPct = (m.count / maxMonthly) * 100;
                    const highlighted = selectedMonth === m.key;
                    return (
                      <div
                        key={m.key}
                        className="flex h-full w-14 shrink-0 flex-1 flex-col items-center justify-end gap-2 sm:w-auto"
                      >
                        <span className="text-xs font-semibold text-ink">{m.count}</span>
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${heightPct}%`,
                            minHeight: m.count > 0 ? "4px" : "2px",
                            backgroundColor: highlighted ? "#FFC500" : "#000000",
                          }}
                        />
                        <span className="text-center text-[11px] leading-tight text-muted">
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-lg font-bold text-ink">
                Ranking de módulos
              </h2>
              {ranking.length === 0 ? (
                <p className="mt-4 text-muted">
                  No hay visitas registradas en el periodo seleccionado.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {ranking.map((r) => (
                    <ModuleRankingRow key={r.moduleId} row={r} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-display text-lg font-bold text-ink">
                Mapa de calor: módulo × mes
              </h2>
              {heatmap.rows.length === 0 ? (
                <p className="mt-4 text-muted">Aún no hay visitas registradas.</p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="whitespace-nowrap border-b border-line bg-paper-soft px-4 py-2 text-left font-semibold text-ink">
                          Módulo
                        </th>
                        {months.map((m) => (
                          <th
                            key={m.key}
                            className="whitespace-nowrap border-b border-line bg-paper-soft px-3 py-2 text-center font-semibold text-ink"
                          >
                            {m.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.rows.map((row) => (
                        <tr key={row.moduleId}>
                          <td className="whitespace-nowrap border-b border-line px-4 py-2 font-medium text-ink">
                            <span className="inline-flex items-center gap-2">
                              {row.module && <Icon name={row.module.icon} className="size-4" />}
                              {row.module?.title ?? row.moduleId}
                            </span>
                          </td>
                          {row.cells.map((count, i) => {
                            const opacity = heatmap.max > 0 ? count / heatmap.max : 0;
                            return (
                              <td
                                key={months[i].key}
                                className="border-b border-line px-3 py-2 text-center font-medium"
                                style={{
                                  backgroundColor: `rgba(0,0,0,${opacity})`,
                                  color: opacity > 0.55 ? "#FFFFFF" : "#000000",
                                }}
                              >
                                {count}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[22px] border border-line bg-bg p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 truncate font-display text-2xl font-extrabold text-ink" title={value}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function MiniBars({
  counts,
  labels,
}: {
  counts: Record<string, number>;
  labels: Record<string, string>;
}) {
  const entries = Object.entries(counts);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="space-y-1">
      {entries.map(([id, count]) => (
        <div key={id} className="flex items-center gap-2 text-xs">
          <span className="w-20 shrink-0 truncate text-muted">{labels[id] ?? id}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-soft">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-5 shrink-0 text-right text-muted">{count}</span>
        </div>
      ))}
    </div>
  );
}

function ModuleRankingRow({
  row,
}: {
  row: {
    moduleId: string;
    module: Module | null;
    total: number;
    ageCounts: Record<string, number>;
    genderCounts: Record<string, number>;
  };
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper-soft text-ink">
          {row.module ? <Icon name={row.module.icon} className="size-5" /> : "?"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-bold text-ink">
            {row.module?.title ?? row.moduleId}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-paper-soft px-3 py-1 text-sm font-semibold text-ink">
          {row.total} visita{row.total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Edad</p>
          <div className="mt-2">
            <MiniBars counts={row.ageCounts} labels={AGE_SHORT_LABELS} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Género</p>
          <div className="mt-2">
            <MiniBars counts={row.genderCounts} labels={GENDER_LABELS} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs italic text-muted">
        Sin dato en visitas por &ldquo;Explorar&rdquo;
      </p>
    </div>
  );
}
