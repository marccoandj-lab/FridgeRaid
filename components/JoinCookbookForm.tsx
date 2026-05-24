"use client";
import { useState } from "react";
import { UserPlus, Hash } from "lucide-react";

interface JoinCookbookFormProps { onSubmit: (code: string) => Promise<boolean>; }

export function JoinCookbookForm({ onSubmit }: JoinCookbookFormProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Unesite kod za pozivnicu"); return; }
    setIsSubmitting(true); setError("");
    try {
      const ok = await onSubmit(code.trim().toUpperCase());
      if (ok) { setCode(""); } else { setError("Neispravan kod"); }
    } catch { setError("Pridruživanje nije uspelo"); } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-amber-500/10 bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><Hash size={16} className="text-amber-500" />Pridruži se kuvarici</h3>
      <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Unesite kod..." maxLength={8}
        className="mb-2 w-full rounded-lg border border-amber-500/10 bg-background px-3 py-2 text-sm font-mono tracking-widest text-foreground placeholder-muted-foreground outline-none transition-all focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20" />
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-background py-2 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/10 disabled:opacity-60">
        <UserPlus size={15} />{isSubmitting ? "Pridruživanje..." : "Pridruži se"}</button>
    </form>
  );
}
