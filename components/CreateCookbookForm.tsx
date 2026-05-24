"use client";
import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";

interface CreateCookbookFormProps { onSubmit: (name: string) => Promise<string | null>; }

export function CreateCookbookForm({ onSubmit }: CreateCookbookFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Unesite naziv"); return; }
    setIsSubmitting(true); setError("");
    try { await onSubmit(name.trim()); setName(""); } catch { setError("Pravljenje nije uspelo"); } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-amber-500/10 bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><BookOpen size={16} className="text-amber-500" />Nova kuvarica</h3>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv kuvarice..."
        className="mb-2 w-full rounded-lg border border-amber-500/10 bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20" />
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-400 disabled:opacity-60">
        <Plus size={15} />{isSubmitting ? "Pravljenje..." : "Napravi"}</button>
    </form>
  );
}
