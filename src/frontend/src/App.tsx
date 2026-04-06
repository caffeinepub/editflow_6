import { Toaster } from "@/components/ui/sonner";
import EditorLayout from "./components/Editor/EditorLayout";
import LoginPage from "./components/LoginPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading EditFlow…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {identity ? <EditorLayout /> : <LoginPage />}
      <Toaster richColors position="top-right" />
    </>
  );
}
