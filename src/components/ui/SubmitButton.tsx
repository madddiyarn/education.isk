"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";

export function SubmitButton({
  label,
  pendingLabel,
  variant,
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel || label : label}
    </Button>
  );
}
