import Image from "next/image";
import Link from "next/link";
import logo from "../../public/back2back-logo.svg";

export default function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Ir al inicio"
      className="inline-flex shrink-0 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <Image
        src={logo}
        alt="Back2Back México"
        className={`w-auto ${className}`}
        preload
      />
    </Link>
  );
}
