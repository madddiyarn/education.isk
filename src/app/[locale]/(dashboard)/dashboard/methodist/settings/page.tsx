import { Role } from "@prisma/client";

import { DetailsDialog } from "@/components/ui/DetailsDialog";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  deleteAssessmentSettingAction,
  generateAssessmentsAction,
  upsertAssessmentSettingAction,
} from "@/features/methodist/actions";
import { requireDatabaseUser } from "@/lib/auth";
import { METHODIST_CLASS_GROUPS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export default async function MethodistSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params;
  const feedback = await searchParams;
  await requireDatabaseUser([Role.METHODIST]);
  const redirectTo = `/${locale}/dashboard/methodist/settings`;

  const [classes, subjects, settings] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.assessmentSetting.findMany({
      orderBy: [{ quarter: "asc" }, { class: { name: "asc" } }, { subject: { name: "asc" } }],
      include: {
        class: true,
        subject: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <FeedbackMessage message={feedback.success} />
      <FeedbackMessage message={feedback.error} tone="error" />
      <DetailsDialog title="Create or update setting">
        <p className="mb-4 text-sm text-slate-400">
          Choose a single class or a whole parallel group like 7, 8, 9, 10, 11PhM10, or 11PhM7. The same quarter
          setting will be applied to every matched class.
        </p>
        <form action={upsertAssessmentSettingAction} className="grid gap-4 md:grid-cols-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Quarter</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="quarter" defaultValue="1">
              {[1, 2, 3, 4].map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Parallel / scope</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="classGroup" defaultValue="SINGLE">
              {METHODIST_CLASS_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Class</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="classId" defaultValue="">
              <option value="">Select class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Subject</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="subjectId" required>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>SAU count</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" defaultValue="2" min="0" name="sorCount" type="number" />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>SAT count</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" defaultValue="1" min="0" name="sochCount" type="number" />
          </label>
          <div className="md:col-span-5">
            <SubmitButton label="Save setting" pendingLabel="Saving..." />
          </div>
        </form>
      </DetailsDialog>

      <div className="grid gap-4">
        {settings.map((setting) => (
          <Panel key={setting.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Q{setting.quarter} • {setting.class.name} • {setting.subject.name}
              </h2>
              <p className="text-sm text-slate-400">
                SAU: {setting.sorCount} • SAT: {setting.sochCount}
              </p>
            </div>

            <form action={upsertAssessmentSettingAction} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="quarter" value={setting.quarter} />
              <input type="hidden" name="classId" value={setting.classId} />
              <input type="hidden" name="subjectId" value={setting.subjectId} />
              <label className="grid gap-2 text-sm text-slate-200">
                <span>SAU count</span>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  defaultValue={setting.sorCount}
                  min="0"
                  name="sorCount"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>SAT count</span>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  defaultValue={setting.sochCount}
                  min="0"
                  name="sochCount"
                  type="number"
                />
              </label>
              <div className="md:col-span-2 self-end">
                <SubmitButton label="Update counts" pendingLabel="Updating..." variant="secondary" />
              </div>
            </form>

            <form action={generateAssessmentsAction} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="quarter" value={setting.quarter} />
              <input type="hidden" name="classId" value={setting.classId} />
              <input type="hidden" name="subjectId" value={setting.subjectId} />
              <label className="grid gap-2 text-sm text-slate-200">
                <span>SAU max score</span>
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" defaultValue="20" min="1" name="sorMaxScore" type="number" step="0.01" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>SAT max score</span>
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" defaultValue="40" min="1" name="sochMaxScore" type="number" step="0.01" />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3 self-end">
                <SubmitButton label="Generate assessments" pendingLabel="Generating..." />
              </div>
            </form>

            <form action={deleteAssessmentSettingAction}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="settingId" value={setting.id} />
              <SubmitButton label="Delete setting" pendingLabel="Deleting..." variant="danger" />
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
