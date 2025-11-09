"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/state/auth-store";
import { useAuthModalStore } from "@/lib/state/auth-modal-store";

const defaultFallback = (
  <div className="flex justify-center py-16 text-sm text-muted-foreground">
    Checking authentication...
  </div>
);

export function RequireAuth({ children, fallback = defaultFallback }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const openModal = useAuthModalStore((state) => state.openModal);
  const isModalOpen = useAuthModalStore((state) => state.open);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      if (!requestedRef.current && !isModalOpen) {
        requestedRef.current = true;
        openModal();
      }
      router.replace("/");
    }
  }, [isModalOpen, loading, openModal, router, user]);

  useEffect(() => {
    if (user) {
      requestedRef.current = false;
    }
  }, [user]);

  if (loading) {
    return fallback;
  }

  if (!user) {
    return null;
  }

  return children;
}
