export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/60 p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-24 rounded-[24px] bg-white/10" />
            <div className="h-12 rounded-2xl bg-white/5" />
            <div className="h-12 rounded-2xl bg-white/5" />
            <div className="h-12 rounded-2xl bg-white/5" />
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded-full bg-white/10" />
            <div className="h-12 w-72 rounded-2xl bg-white/10" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-36 rounded-[28px] bg-white/5" />
              <div className="h-36 rounded-[28px] bg-white/5" />
              <div className="h-36 rounded-[28px] bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
