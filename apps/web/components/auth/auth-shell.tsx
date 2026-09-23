import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  /** Small mono-caps label in the brand panel footer, e.g. "SECURE COOKIE · 30 DAY SESSION". */
  side: string;
  /** Top-right link, e.g. "No account? Create one" */
  topLink: { label: string; href: string; cta: string };
  children: ReactNode;
};

/** Two-column auth layout matching the Signal design system's VMAuthShell. */
export function AuthShell({ side, topLink, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-vm-paper text-vm-ink lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-vm-line bg-vm-panel px-8 py-7 lg:flex">
        <Wordmark />
        <div className="flex flex-col gap-5">
          <p className="font-mono text-[11px] tracking-[0.08em] text-vm-accent">VIDEOMAX · PRIVATE LIBRARY</p>
          <h2 className="text-[34px] font-semibold leading-[1.08] tracking-tight">
            Your videos,
            <br />
            transcribed and
            <br />
            searchable.
          </h2>
        </div>
        <p className="font-mono text-[10px] tracking-[0.06em] text-vm-muted">{side}</p>
      </div>

      <div className="flex flex-col px-6 py-7 sm:px-10">
        <div className="text-right text-xs text-vm-muted">
          {topLink.label}{" "}
          <Link href={topLink.href} className="font-medium text-vm-accent hover:underline">
            {topLink.cta} &rarr;
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">{children}</div>
        <p className="text-center font-mono text-[11px] tracking-[0.04em] text-vm-faint">VIDEOMAX</p>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <div className="inline-flex items-center gap-2 text-vm-ink">
      <span className="text-vm-accent" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 8.2 L16.5 12 L9 15.8 Z" fill="currentColor" />
          <line x1="2.5" y1="17.5" x2="21.5" y2="17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.35" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">
        videomax<span className="text-vm-accent">.</span>
      </span>
    </div>
  );
}
