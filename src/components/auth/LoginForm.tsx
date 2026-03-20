"use client";

import { useActionState } from "react";

import { loginAction } from "@/features/auth/actions";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LoginForm({ locale }: { locale: string }) {
  const [state, formAction] = useActionState(loginAction.bind(null, locale), undefined);

  return (
    <form action={formAction} className="grid gap-4">
      <FeedbackMessage message={state?.error} tone="error" />
      <Input label={locale === "ru" ? "Логин" : "Login"} name="login" placeholder="moderator" required />
      <Input
        label={locale === "ru" ? "Пароль" : "Password"}
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
      <SubmitButton
        label={locale === "ru" ? "Войти" : "Sign in"}
        pendingLabel={locale === "ru" ? "Проверка..." : "Checking..."}
      />
    </form>
  );
}
