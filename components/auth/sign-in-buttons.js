"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithProvider } from "@/components/providers/firebase-auth-provider";
import { toast } from "sonner";

const providers = [
  { id: "google", label: "Continue with Google" },
  // GitHub auth is configured but intentionally hidden until required.
];

export function SignInButtons({ onSuccess }) {
  const [loadingProvider, setLoadingProvider] = useState(null);

  async function handleSignIn(providerId) {
    setLoadingProvider(providerId);
    try {
      await signInWithProvider(providerId);
      onSuccess?.();
      toast.success("Signed in successfully");
    } catch (error) {
      console.error("sign-in failed", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          onClick={() => handleSignIn(provider.id)}
          disabled={loadingProvider === provider.id}
          className="justify-center"
        >
          {loadingProvider === provider.id ? "Signing in..." : provider.label}
        </Button>
      ))}
    </div>
  );
}
