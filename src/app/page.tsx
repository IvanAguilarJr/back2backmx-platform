import Link from "next/link";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import NavLink from "@/components/NavLink";
import { getAllModules } from "@/lib/modules";

// los módulos se editan desde /admin; sin esto la landing quedaría
// congelada con el contenido que existía en el último build
export const revalidate = 60;

// Cada tarjeta se ancla cerca del borde izquierdo o derecho (inset chico,
// <=5%) y nunca cerca del centro horizontal: así, sin importar su
// posición vertical, se queda fuera de la franja donde vive el headline
// en vez de tener que calzar con su altura exacta.
const FLOATING_SLOTS = [
  "absolute top-[4%] left-[3%] -rotate-6",
  "absolute top-[38%] left-[2%] rotate-3",
  "absolute bottom-[6%] left-[4%] rotate-2",
  "absolute bottom-[32%] left-[5%] -rotate-4",
  "absolute top-[4%] right-[3%] rotate-6",
  "absolute top-[38%] right-[2%] -rotate-3",
  "absolute bottom-[6%] right-[4%] -rotate-2",
  "absolute bottom-[32%] right-[5%] rotate-4",
];

const ALTERNATING_STYLES = [
  { bg: "bg-ink", text: "text-bg" },
  { bg: "bg-gray-deep", text: "text-bg" },
];

export default async function Home() {
  const modules = await getAllModules();
  const floating = modules.slice(0, FLOATING_SLOTS.length);

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <Logo />
        <NavLink href="/admin/login">Panel</NavLink>
      </header>

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24 min-[1280px]:min-h-[720px]">
        <div className="hidden min-[1280px]:block">
          {floating.map((mod, i) => {
            const style = mod.priority
              ? { bg: "bg-yellow", text: "text-ink" }
              : ALTERNATING_STYLES[i % 2];
            return (
              <Link
                key={mod.id}
                href={`/modulo/${mod.id}`}
                className={`z-0 block w-48 rounded-2xl p-4 shadow-lg transition-transform hover:-translate-y-0.5 ${style.bg} ${style.text} ${FLOATING_SLOTS[i]}`}
              >
                <Icon name={mod.icon} className="size-5 opacity-70" />
                <p className="mt-2 line-clamp-3 font-display text-sm font-semibold">
                  {mod.title}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="relative z-10 mx-auto max-w-[620px] rounded-[28px] bg-bg px-6 py-10 text-center min-[1280px]:py-16">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Apoyo real cuando tu{" "}
            <span className="inline-block -rotate-1 rounded bg-yellow px-2 text-ink">
              familia
            </span>{" "}
            más lo necesita
          </h1>
          <p className="mx-auto mt-5 max-w-md text-muted">
            Back2Back acompaña a familias con hijos adoptivos (5 a 19 años)
            con recursos filtrados a su situación.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/explorar"
              className="rounded-full bg-ink px-6 py-3 font-medium text-bg transition-colors hover:bg-gray-deep"
            >
              Explorar todo
            </Link>
            <Link
              href="/buscar"
              className="rounded-full bg-yellow px-6 py-3 font-medium text-ink transition-colors hover:bg-yellow-deep"
            >
              Buscar por edad y situación
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
