import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6">
        <DashboardShell />
      </div>
    </div>
  );
}
