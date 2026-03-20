import { Panel } from "@/components/ui/Panel";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Panel className="w-full max-w-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="h-10 w-2/3 rounded-2xl bg-white/10" />
          <div className="h-24 rounded-[24px] bg-white/5" />
          <div className="h-12 rounded-2xl bg-white/10" />
          <div className="h-12 rounded-2xl bg-white/10" />
        </div>
      </Panel>
    </div>
  );
}
