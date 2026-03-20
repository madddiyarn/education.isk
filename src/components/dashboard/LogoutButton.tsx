import { logoutAction } from "@/features/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { Locale } from "@/types";

export function LogoutButton({
  locale,
  label,
  pendingLabel,
}: {
  locale: Locale;
  label: string;
  pendingLabel: string;
}) {
  const action = logoutAction.bind(null, locale);

  return (
    <form action={action}>
      <SubmitButton label={label} pendingLabel={pendingLabel} variant="ghost" />
    </form>
  );
}
