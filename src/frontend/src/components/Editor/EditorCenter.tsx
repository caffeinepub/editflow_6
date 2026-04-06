import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Download,
  Loader2,
  MoreHorizontal,
  Save,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Document } from "../../backend";
import FormattingToolbar from "./FormattingToolbar";
import VersionHistoryModal from "./VersionHistoryModal";

interface EditorCenterProps {
  activeDoc: Document | null;
  title: string;
  content: string;
  hasUnsaved: boolean;
  isSaving: boolean;
  onTitleChange: (t: string) => void;
  onContentChange: (c: string) => void;
  onSave: () => void;
  onShowVersionHistory: () => void;
  showVersionHistory: boolean;
  onCloseVersionHistory: () => void;
  onRestoreContent: (content: string, title: string) => void;
}

export default function EditorCenter({
  activeDoc,
  title,
  content,
  hasUnsaved,
  isSaving,
  onTitleChange,
  onContentChange,
  onSave,
  onShowVersionHistory,
  showVersionHistory,
  onCloseVersionHistory,
  onRestoreContent,
}: EditorCenterProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const activeDocId = activeDoc?.id;

  // Sync content to editor when switching docs
  // We intentionally only run this when activeDocId changes, not on every content update
  // (content is managed imperatively via onInput)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [activeDocId]);

  const handleInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleExport = () => {
    if (!activeDoc) return;
    const plainText = content.replace(/<[^>]+>/g, "");
    const blob = new Blob([plainText], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const handleShare = () => {
    if (!activeDoc) return;
    const url = `${window.location.origin}${window.location.pathname}?doc=${activeDoc.id.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
    });
  };

  if (!activeDoc) {
    return (
      <main
        className="flex-1 flex items-center justify-center"
        style={{ background: "oklch(0.945 0.01 240)" }}
        data-ocid="editor.empty_state"
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.92 0.018 240)" }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: "oklch(0.55 0.045 245)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="No document"
              role="img"
            >
              <title>No document open</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: "oklch(0.35 0.04 245)" }}
          >
            No document open
          </h3>
          <p className="text-sm" style={{ color: "oklch(0.58 0.025 245)" }}>
            Select a document from the sidebar or create a new one
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="flex-1 flex flex-col overflow-hidden"
      data-ocid="editor.panel"
    >
      {/* Dark navy title bar */}
      <div
        className="editor-title-bar flex items-center justify-between px-3 md:px-4 h-11 shrink-0 gap-2"
        data-ocid="editor.title.panel"
      >
        {/* Title + unsaved indicator */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <input
            data-ocid="editor.title.input"
            className="bg-transparent text-white font-semibold text-[15px] outline-none placeholder:text-white/40 truncate min-w-0 w-full"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled document"
            style={{ caretColor: "white" }}
          />
          {hasUnsaved && (
            <span className="text-[11px] text-white/50 shrink-0 hidden sm:inline">
              (unsaved)
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Save — always visible */}
          <Button
            data-ocid="editor.save.primary_button"
            size="sm"
            className="h-7 px-2.5 md:px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 md:mr-1 animate-spin" />
            ) : (
              <Save className="w-3 h-3 md:mr-1" />
            )}
            <span className="hidden md:inline">
              {isSaving ? "Saving…" : "Save"}
            </span>
          </Button>

          {/* Download — always visible and prominent */}
          <Button
            data-ocid="editor.export.button"
            size="sm"
            className="h-7 px-2.5 md:px-3 text-[12px] font-medium rounded-full bg-white/20 hover:bg-white/35 text-white border border-white/20"
            onClick={handleExport}
          >
            <Download className="w-3 h-3 md:mr-1" />
            <span className="hidden md:inline">Download</span>
          </Button>

          {/* Share — hidden on smallest screens, visible on sm+ */}
          <Button
            data-ocid="editor.share.button"
            size="sm"
            className="hidden sm:flex h-7 px-2.5 md:px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={handleShare}
          >
            <Share2 className="w-3 h-3 md:mr-1" />
            <span className="hidden md:inline">Share</span>
          </Button>

          {/* Version History — hidden on small screens */}
          <Button
            data-ocid="editor.version_history.button"
            size="sm"
            className="hidden lg:flex h-7 px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={onShowVersionHistory}
          >
            <Clock className="w-3 h-3 mr-1" />
            Version History
          </Button>

          {/* More dropdown — visible on mobile/tablet to access hidden actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-ocid="editor.more.button"
                size="sm"
                className="lg:hidden h-7 w-7 px-0 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                data-ocid="editor.more.share.button"
                onClick={handleShare}
                className="gap-2 text-sm cursor-pointer sm:hidden"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="editor.more.version_history.button"
                onClick={onShowVersionHistory}
                className="gap-2 text-sm cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                Version History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Formatting toolbar */}
      <FormattingToolbar editorRef={editorRef} />

      {/* Editor canvas */}
      <div
        className="flex-1 overflow-y-auto py-4 px-2 md:py-8 md:px-6"
        style={{ background: "oklch(0.945 0.01 240)" }}
      >
        <motion.div
          className="mx-auto bg-white rounded-sm editor-page-shadow"
          style={{
            maxWidth: 760,
            minHeight: 900,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          key={activeDoc?.id?.toString()}
        >
          <div
            className="editor-page-padding"
            style={{
              padding: "clamp(16px, 4vw, 52px) clamp(14px, 5vw, 64px)",
            }}
          >
            <div
              ref={editorRef}
              data-ocid="editor.canvas_target"
              contentEditable
              suppressContentEditableWarning
              className="editor-content"
              data-placeholder="Start typing your document…"
              onInput={handleInput}
              spellCheck
            />
          </div>
        </motion.div>
      </div>

      {/* Version History Modal */}
      {activeDoc && (
        <VersionHistoryModal
          open={showVersionHistory}
          onClose={onCloseVersionHistory}
          documentId={activeDoc.id}
          documentTitle={title}
          onRestore={onRestoreContent}
        />
      )}
    </main>
  );
}
