import Logo from "@/components/Logo";
import ModuleCard from "@/components/ModuleCard";
import NavLink from "@/components/NavLink";
import { getAllModules } from "@/lib/modules";

export const revalidate = 60;

export default async function ExplorarPage() {
  const modules = await getAllModules();

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Logo className="h-8" />
          <NavLink href="/">← Inicio</NavLink>
        </div>

        <div className="mt-8 text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl lg:text-5xl">
            Explora los módulos
          </h1>
          <p className="mt-2 text-muted">
            Viendo todos los módulos, sin filtrar por edad.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </div>
    </main>
  );
}
