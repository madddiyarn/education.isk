import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { roleHomePaths } from "@/lib/access";
import { getPreferredLocale } from "@/lib/locale";

export default async function RootPage() {
  const locale = await getPreferredLocale();
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect(`/${locale}/login`);
  }

  redirect(roleHomePaths[sessionUser.role](locale));
}
