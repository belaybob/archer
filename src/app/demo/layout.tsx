import Link from "next/link";
import { DemoNav } from "./DemoNav";

/**
 * Public, no-login demo of a fully-run tournament (sample data from
 * src/lib/demo-data.ts) -- lets a prospective organizer see what running a
 * tournament in Archer actually looks like before creating an account.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient-bg">
      <div
        style={{
          background: "var(--ink)",
          color: "#fff",
          textAlign: "center",
          padding: "0.6rem 1rem",
          fontSize: "0.88rem",
        }}
      >
        You&apos;re viewing a demo event with sample data — no account needed.{" "}
        <Link href="/signup" style={{ color: "#f2d999", fontWeight: 600, textDecoration: "none" }}>
          Get started free &rarr;
        </Link>
      </div>

      <header style={{ padding: "1.25rem 0" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.3rem",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            Archer
          </Link>
          <DemoNav />
        </div>
      </header>
      {children}
    </div>
  );
}
