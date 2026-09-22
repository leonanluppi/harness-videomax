import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkVariant = "solid" | "outline" | "ghost";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonLinkVariant;
};

const VARIANT_CLASSES: Record<ButtonLinkVariant, string> = {
  solid: "bg-vm-accent text-white hover:bg-vm-accent-hi",
  outline: "border border-vm-line-strong bg-vm-surface text-vm-ink hover:border-vm-accent",
  ghost: "text-vm-ink-2 hover:text-vm-ink",
};

/** Shared CTA primitive: button-compatible link dimensions across landing and auth pages. */
export function ButtonLink({ variant = "solid", className = "", ...props }: ButtonLinkProps) {
  const base = "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors";
  return <Link {...props} className={`${base} ${VARIANT_CLASSES[variant]} ${className}`} />;
}
