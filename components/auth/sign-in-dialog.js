"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import { useAuthModalStore } from "@/lib/state/auth-modal-store";

export function SignInDialog() {
  const open = useAuthModalStore((state) => state.open);
  const closeModal = useAuthModalStore((state) => state.closeModal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKey(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [closeModal, open]);

  if (!mounted) {
    return null;
  }

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-background shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
          aria-label="Close sign in dialog"
        >
          <X className="size-4" />
        </button>
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-base font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Continue with Google to access your workspace.
          </p>
        </div>
        <div className="px-6 py-5">
          <SignInButtons onSuccess={closeModal} />
        </div>
      </div>
    </div>,
    document.body
  );
}
