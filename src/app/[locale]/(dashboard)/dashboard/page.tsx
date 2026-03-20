import { redirectToRoleHome, requireUser } from "@/lib/auth";
import { normalizeLocale } from "@/lib/locale";

export default async function DashboardIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const sessionUser = await requireUser();

  redirectToRoleHome(locale, sessionUser.role);
}
