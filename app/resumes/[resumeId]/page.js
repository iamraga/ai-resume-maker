import { RequireAuth } from "@/components/auth/require-auth";
import { ResumeEditorView } from "@/components/editor/resume-editor-view";

export default async function ResumeEditorPage({ params }) {
  const { resumeId } = await params;

  return (
    <RequireAuth>
      <ResumeEditorView resumeId={resumeId} />
    </RequireAuth>
  );
}
