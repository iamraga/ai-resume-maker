"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/components/providers/firebase-auth-provider";
import { toast } from "sonner";

function getInitials(user) {
  if (user?.displayName) {
    const parts = user.displayName.split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (user?.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleProfile() {
    setOpen(false);
    router.push("/profile");
  }

  async function handleLogout() {
    setOpen(false);
    try {
      await signOutUser();
      toast.success("Signed out");
      router.push("/");
    } catch (error) {
      console.error("sign-out failed", error);
      toast.error("Failed to sign out. Please try again.");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-sm font-medium text-muted-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        {user?.photoURL ? (
          <div className="relative size-full overflow-hidden rounded-full">
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "User avatar"}
              fill
              sizes="36px"
              className="object-cover"
              unoptimized
              priority={false}
            />
          </div>
        ) : (
          <span>{getInitials(user)}</span>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-border bg-popover shadow-lg"
        >
          <button
            type="button"
            onClick={handleProfile}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-foreground transition hover:bg-muted"
            role="menuitem"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-foreground transition hover:bg-muted"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
