export function FeedbackMessage({
  message,
  tone = "success",
}: {
  message?: string;
  tone?: "success" | "error";
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "success"
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : "border-rose-400/30 bg-rose-500/10 text-rose-200"
      }`}
    >
      {message}
    </div>
  );
}
