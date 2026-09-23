import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT_CLASSES: Record<Variant, string> = {
  solid: "border border-vm-accent-hi bg-vm-accent text-white hover:bg-vm-accent-hi",
  outline: "border border-vm-line-strong bg-vm-surface text-vm-ink hover:border-vm-accent",
  ghost: "border border-transparent text-vm-ink-2 hover:text-vm-ink",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-9 px-3.5",
  lg: "h-10 w-full px-4",
};

function classesFor(variant: Variant, size: Size, className?: string): string {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ""}`;
}

type ButtonLinkAnchorProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

/** Shared CTA primitive: renders as a Next.js Link when `href` is given. */
export function ButtonLink({ href, variant = "outline", size = "md", children, ...anchorProps }: ButtonLinkAnchorProps) {
  return (
    <Link href={href} className={classesFor(variant, size)} {...anchorProps}>
      {children}
    </Link>
  );
}

type ButtonLinkButtonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

/** Button-compatible sibling of ButtonLink for actions that are not navigations. */
export function ButtonLinkButton({ variant = "solid", size = "lg", children, type = "button", ...buttonProps }: ButtonLinkButtonProps) {
  return (
    <button type={type} className={classesFor(variant, size)} {...buttonProps}>
      {children}
    </button>
  );
}
