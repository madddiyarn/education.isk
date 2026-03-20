import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { Panel } from "@/components/ui/Panel";
import { getSessionUser } from "@/lib/auth";
import { roleHomePaths } from "@/lib/access";
import { DEFAULT_MODERATOR_LOGIN, DEFAULT_MODERATOR_PASSWORD } from "@/lib/constants";
import { getDictionary } from "@/lib/dictionaries";
import { normalizeLocale } from "@/lib/locale";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const dictionary = getDictionary(locale);
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect(roleHomePaths[sessionUser.role](locale));
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="relative overflow-hidden p-8 lg:p-12">
          <div className="absolute -left-10 top-0 h-44 w-44 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.32em] text-teal-200">{dictionary.appName}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-bold text-white md:text-5xl">
              {dictionary.loginTitle}
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-300">{dictionary.loginSubtitle}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{dictionary.noRegistration}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{dictionary.usersHint}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{dictionary.defaultModerator}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {dictionary.login}: <span className="font-semibold text-white">{DEFAULT_MODERATOR_LOGIN}</span>
                  <br />
                  {dictionary.password}: <span className="font-semibold text-white">{DEFAULT_MODERATOR_PASSWORD}</span>
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{dictionary.signIn}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{dictionary.dashboard}</h2>
            <p className="mt-2 text-sm text-slate-400">{dictionary.noRegistration}</p>
          </div>
          <LoginForm locale={locale} />
        </Panel>
      </div>
    </div>
  );
}
