"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const LINKS = [
  { href: "/dashboard", label: "Niches" },
  { href: "/opportunities", label: "Historique" },
  { href: "/stats", label: "Statistiques" },
  { href: "/calculator", label: "Calculatrice" },
  { href: "/ai", label: "Analyse IA" },
  { href: "/share", label: "Partager" },
  { href: "/settings", label: "Reglages" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/dashboard" className="font-display text-lg font-semibold text-paper shrink-0">
          Niches
        </Link>
        <nav className="flex items-center gap-1 flex-wrap">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-1.5 rounded-tag text-sm",
                pathname?.startsWith(link.href)
                  ? "bg-panel text-amber border border-line"
                  : "text-mute hover:text-paper"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1.5 rounded-tag text-sm text-mute hover:text-clay"
          >
            Deconnexion
          </button>
        </nav>
      </div>
    </header>
  );
}
