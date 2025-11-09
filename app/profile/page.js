import { ProfileContent } from "@/components/profile/profile-content";
import { RequireAuth } from "@/components/auth/require-auth";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
