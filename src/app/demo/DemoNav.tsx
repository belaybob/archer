"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/demo", label: "Overview" },
  { href: "/demo/registrants", label: "Registrants" },
  { href: "/demo/standings", label: "Standings" },
  { href: "/demo/bracket", label: "Bracket" },
];

export function DemoNav() {
  const pathname = usePathname();

  return (
    <nav className="pill-nav">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`pill-nav-link${pathname === link.href ? " active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
      <Link href="/signup" className="pill-btn pill-btn-accent pill-btn-sm">
        Get started
      </Link>
    </nav>
  );
}
