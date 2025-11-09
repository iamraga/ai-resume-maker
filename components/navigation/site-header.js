"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/state/auth-store";
import { useAuthModalStore } from "@/lib/state/auth-modal-store";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const openModal = useAuthModalStore((state) => state.openModal);

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          AI Resume Builder
        </Link>
        {loading ? (
          <span className="text-xs text-muted-foreground">Loading...</span>
        ) : user ? (
          <UserMenu user={user} />
        ) : (
          <Button size="sm" variant="outline" onClick={openModal}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
