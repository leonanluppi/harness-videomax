import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  side: string;
  children: ReactNode;
};

/** Signal (dark) auth layout: brand panel + form column, stacking on small screens. */
export function AuthShell({ side, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-vm-paper text-vm-ink lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-vm-line bg-vm-panel p-8 lg:flex">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          videomax<span className="text-vm-accent">.</span>
        </Link>
        <div className="flex flex-col gap-5">
          <p className="font-mono text-[11px] tracking-[0.08em] text-vm-accent uppercase">
            videomax · private library
          </p>
          <p className="text-[34px] leading-[1.08] font-semibold tracking-tight">
            Your videos,
            <br />
            transcribed and
            <br />
            searchable.
          </p>
        </div>
        <p className="font-mono text-[10px] tracking-[0.06em] text-vm-muted uppercase">{side}</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
