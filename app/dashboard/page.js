import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <div className="px-6">
          <DashboardShell />
        </div>
      </div>
    </RequireAuth>
  );
}
