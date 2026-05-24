"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Trash2, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CookbookRecipe } from "@/types/cookbook";

interface CookbookRecipeCardProps {
  recipe: CookbookRecipe;
  isLiked: boolean;
  currentUserId: string;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  index?: number;
}

export function CookbookRecipeCard({ recipe, isLiked, currentUserId, onLike, onDelete, index = 0 }: CookbookRecipeCardProps) {
  const displayName = recipe.type === "meal" ? (recipe.strMeal || "Bez naziva") : (recipe.name || "Bez naziva");
  const thumbnail = recipe.type === "meal" ? recipe.strMealThumb : recipe.imageUrl;
  const canDelete = recipe.addedBy === currentUserId;

  const card = (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 hover:ring-amber-500/20">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-500/10 to-background">
        {thumbnail ? (
          <Image src={thumbnail} alt={displayName} fill className="object-cover transition-all duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center"><span className="font-heading text-2xl font-bold text-amber-500/30">{displayName.charAt(0).toUpperCase()}</span></div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">{recipe.type === "meal" ? "MealDB" : "Prilagođeno"}</span>
      </div>
      <div className="p-3">
        <h3 className="font-heading line-clamp-1 text-sm font-bold text-foreground group-hover:text-amber-300 transition-colors">{displayName}</h3>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><User size={11} />{recipe.authorName || "Anonimno"}</p>
        <div className="mt-2 flex items-center justify-between">
          <button onClick={(e) => { e.stopPropagation(); onLike(recipe.id); }} className={cn("flex items-center gap-1 rounded-full px-2 py-1 transition-colors text-xs", isLiked ? "text-red-400" : "text-muted-foreground hover:text-red-400")}>
            <Heart size={14} className={isLiked ? "fill-red-400" : ""} />{recipe.likes.length}
          </button>
          {canDelete && onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }} className="text-muted-foreground/50 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return recipe.type === "meal" && recipe.idMeal ? (
    <Link href={`/recipe/${recipe.idMeal}`}>{card}</Link>
  ) : card;
}
