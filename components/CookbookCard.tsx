"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ChefHat, Trash2 } from "lucide-react";
import type { CookbookWithMeta } from "@/types/cookbook";

interface CookbookCardProps {
  cookbook: CookbookWithMeta;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  index?: number;
}

export function CookbookCard({ cookbook, isOwner, onDelete, index = 0 }: CookbookCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
      <Link href={`/cookbooks/${cookbook.id}`} className="block group">
        <div className="relative overflow-hidden rounded-xl border-l-4 border-amber-500/60 bg-card p-5 ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:ring-amber-500/20">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading truncate text-lg font-bold text-foreground group-hover:text-amber-300 transition-colors">{cookbook.name}</h3>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={13} />{cookbook.memberCount}</span>
                <span className="flex items-center gap-1"><ChefHat size={13} />{cookbook.recipeCount}</span>
              </div>
            </div>
            <div className="shrink-0 rounded-md bg-amber-500/10 px-2.5 py-1">
              <code className="text-[11px] font-mono font-bold tracking-wider text-amber-400">{cookbook.inviteCode}</code>
            </div>
          </div>
          {isOwner && onDelete && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm("Delete for everyone?")) onDelete(cookbook.id); }}
              className="absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-red-400">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
