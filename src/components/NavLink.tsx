import Link from "next/link";
import type { ReactNode } from "react";

const navLinkClass =
  "inline-flex items-center rounded-full border-[1.5px] border-line px-4 py-[9px] text-sm font-semibold text-muted transition-colors duration-150 hover:border-ink hover:text-ink";

type NavLinkProps = {
  children: ReactNode;
  className?: string;
} & (
  | { href: string; onClick?: never }
  | { href?: undefined; onClick: () => void }
);

// "Ghost pill" para navegación secundaria — Inicio, Panel, Cerrar sesión,
// etc. Los botones primarios (Explorar todo, Buscar...) tienen su propio
// estilo sólido y no deben usar este componente.
export default function NavLink({ children, className = "", ...props }: NavLinkProps) {
  const classes = `${navLinkClass} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={classes}>
      {children}
    </button>
  );
}
