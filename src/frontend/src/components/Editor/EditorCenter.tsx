import { Button } from "@/components/ui/button";
import { Clock, Download, Loader2, Save, Share2 } from "lucide-react";
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
    const blob = new Blob([content.replace(/<[^>]+>/g, "")], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document exported");
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
        className="editor-title-bar flex items-center justify-between px-4 h-11 shrink-0"
        data-ocid="editor.title.panel"
      >
        <div className="flex items-center gap-2 min-w-0">
          <input
            data-ocid="editor.title.input"
            className="bg-transparent text-white font-semibold text-[15px] outline-none placeholder:text-white/40 truncate min-w-0"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled document"
            style={{ caretColor: "white" }}
          />
          {hasUnsaved && (
            <span className="text-[11px] text-white/50 shrink-0">
              (unsaved)
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            data-ocid="editor.save.primary_button"
            size="sm"
            className="h-7 px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            Save
          </Button>
          <Button
            data-ocid="editor.export.button"
            size="sm"
            className="h-7 px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={handleExport}
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button
            data-ocid="editor.share.button"
            size="sm"
            className="h-7 px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={handleShare}
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          <Button
            data-ocid="editor.version_history.button"
            size="sm"
            className="h-7 px-3 text-[12px] font-medium rounded-full bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={onShowVersionHistory}
          >
            <Clock className="w-3 h-3 mr-1" />
            Version History
          </Button>
        </div>
      </div>

      {/* Formatting toolbar */}
      <FormattingToolbar editorRef={editorRef} />

      {/* Editor canvas */}
      <div
        className="flex-1 overflow-y-auto py-8 px-6"
        style={{ background: "oklch(0.945 0.01 240)" }}
      >
        <motion.div
          className="mx-auto bg-white rounded-sm editor-page-shadow"
          style={{ maxWidth: 760, minHeight: 900, padding: "52px 64px" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          key={activeDoc?.id?.toString()}
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
