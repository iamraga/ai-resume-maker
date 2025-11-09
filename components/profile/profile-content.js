"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/state/auth-store";

export function ProfileContent() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const provider = user.providerData?.[0];
  const profileDetails = [
    { label: "Full name", value: user.displayName || "—" },
    { label: "Email", value: user.email || "—" },
    { label: "Email verified", value: user.emailVerified ? "Yes" : "No" },
    { label: "Provider", value: provider?.providerId || user.providerId || "—" },
    { label: "User ID", value: user.uid },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-lg font-semibold text-muted-foreground">
              {user.photoURL ? (
                <div className="relative size-full">
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? "User avatar"}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                (user.displayName || user.email || "User").slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-lg font-medium">{user.displayName || "Unnamed user"}</p>
              <p className="text-sm text-muted-foreground">{user.email || "No email on file"}</p>
            </div>
          </div>
          <dl className="grid gap-4">
            {profileDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-1 rounded-md border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-sm font-medium text-muted-foreground">{detail.label}</dt>
                <dd className="text-sm text-foreground sm:text-right">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
