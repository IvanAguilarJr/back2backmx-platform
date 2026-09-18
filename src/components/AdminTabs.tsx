"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Módulos" },
  { href: "/admin/dashboard", label: "Dashboard" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-soft p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active ? "bg-ink text-bg" : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
