import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400",
  secondary:
    "bg-slate-900/80 text-slate-100 ring-1 ring-white/10 hover:bg-slate-800",
  ghost: "bg-transparent text-slate-300 hover:bg-white/5",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
