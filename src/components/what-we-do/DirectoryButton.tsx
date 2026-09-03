import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "on-colour" | "ghost";
  className?: string;
};

export default function DirectoryButton({
  href,
  children,
  variant = "primary",
  className = "",
}: Props) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  if (variant === "on-colour") {
    return (
      <Link
        href={href}
        className={`${base} bg-bs-offwhite text-black focus-visible:ring-bs-offwhite ${className}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0 bg-bs-pink transition-[width] duration-200 ease-out group-hover:w-full"
        />
        <span className="relative z-10 transition-colors duration-200 group-hover:text-white">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="relative z-10 inline-block transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-hover:text-white"
        >
          →
        </span>
      </Link>
    );
  }

  if (variant === "ghost") {
    return (
      <Link
        href={href}
        className={`${base} border border-current/30 text-current focus-visible:ring-current hover:border-current ${className}`}
      >
        <span className="relative z-10">{children}</span>
        <span
          aria-hidden="true"
          className="relative z-10 inline-block transition-transform duration-200 ease-out group-hover:translate-x-1.5"
        >
          ↓
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} bg-black text-white focus-visible:ring-black ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0 bg-bs-purple transition-[width] duration-200 ease-out group-hover:w-full"
      />
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="relative z-10 inline-block transition-transform duration-200 ease-out group-hover:translate-x-1.5"
      >
        →
      </span>
    </Link>
  );
}
