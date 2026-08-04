import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow-sm">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        </div>
        <p className="text-sm text-[#94a3b8] font-medium">Loading…</p>
      </div>
    </div>
  );
}
