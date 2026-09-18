import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import ModuleView from "@/components/ModuleView";
import ModuleVisitTracker from "@/components/ModuleVisitTracker";
import NavLink from "@/components/NavLink";
import { getModule, getPiecesForModule, filterPiecesForAge } from "@/lib/modules";
import type { VisitSource } from "@/lib/analytics";

export const revalidate = 60;

export default async function ModuloPage(props: PageProps<"/modulo/[id]">) {
  const { id } = await props.params;
  const { age: ageParam, source: sourceParam, gender: genderParam } =
    await props.searchParams;
  const age = typeof ageParam === "string" ? ageParam : null;
  const gender = typeof genderParam === "string" ? genderParam : null;
  const source: VisitSource = sourceParam === "buscar" ? "buscar" : "explorar";

  const module = await getModule(id);
  if (!module) notFound();

  const allPieces = await getPiecesForModule(id);
  const pieces = age ? filterPiecesForAge(allPieces, age) : allPieces;

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-10 sm:px-6">
      <ModuleVisitTracker moduleId={module.id} source={source} age={age} gender={gender} />
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Logo className="h-8" />
          <NavLink href="/explorar">Volver a explorar</NavLink>
        </div>

        <div className="mt-6 flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-bg">
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
          </div>
        </div>

        <div className="mt-10">
          <ModuleView
            module={module}
            pieces={pieces}
            totalPieces={allPieces.length}
            age={age}
          />
        </div>
      </div>
    </main>
  );
}
