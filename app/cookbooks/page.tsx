"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { CookbookCard } from "@/components/CookbookCard";
import { CreateCookbookForm } from "@/components/CreateCookbookForm";
import { JoinCookbookForm } from "@/components/JoinCookbookForm";
import { Navbar } from "@/components/Navbar";
import { useCookbooks } from "@/hooks/useCookbooks";
import { useAuth } from "@/lib/AuthProvider";
import { auth } from "@/lib/firebase";

export default function CookbooksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { cookbooks, isLoading, createCookbook, joinCookbook, deleteCookbook } = useCookbooks();

  useEffect(() => {
    if (!authLoading && !user && !auth.currentUser) router.push("/auth");
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-4xl">Cookbooks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, share, and collaborate on recipe collections</p>
      </motion.div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-card ring-1 ring-foreground/5" />)}</div>
          ) : cookbooks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/20 bg-card/50 py-16 text-center">
              <BookOpen size={40} className="mb-3 text-amber-500/40" />
              <p className="font-heading text-lg font-bold text-foreground">No cookbooks yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create one or join with an invite code</p>
            </motion.div>
          ) : (
            <div className="space-y-3">{cookbooks.map((book, i) => <CookbookCard key={book.id} cookbook={book} isOwner={book.ownerId === user.uid} onDelete={deleteCookbook} index={i} />)}</div>
          )}
        </div>
        <div className="space-y-4 lg:w-[320px] lg:shrink-0 lg:sticky lg:top-24 lg:self-start">
          <CreateCookbookForm onSubmit={createCookbook} />
          <JoinCookbookForm onSubmit={joinCookbook} />
        </div>
      </div>
    </main>
    </>
  );
}
