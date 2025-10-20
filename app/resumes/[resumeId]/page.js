import { EditorShell } from "@/components/editor/editor-shell";

export default function ResumeEditorPage({ params }) {
  const { resumeId } = params;

  return (
    <div className="min-h-screen bg-background px-6">
      <header className="mx-auto max-w-6xl py-10">
        <p className="text-sm text-muted-foreground">Editing resume · {resumeId}</p>
        <h1 className="text-3xl font-semibold tracking-tight">AI-powered resume workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update sections, chat with the AI assistant, and preview changes in real time.
        </p>
      </header>
      <main className="mx-auto max-w-6xl">
        <EditorShell />
      </main>
    </div>
  );
}
