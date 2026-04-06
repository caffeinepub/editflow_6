import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Document, DocumentId } from "../../backend";
import {
  useCreateDocument,
  useGetUserDocuments,
  useUpdateDocument,
} from "../../hooks/useQueries";
import EditorCenter from "./EditorCenter";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";
import TopNav from "./TopNav";

export type SidebarView = "all" | "templates" | "trash" | "folder";

export default function EditorLayout() {
  const [activeDocId, setActiveDocId] = useState<DocumentId | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarView, setSidebarView] = useState<SidebarView>("all");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<bigint | null>(null);

  const { data: documents = [], isLoading } = useGetUserDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();

  // Filtered docs based on search + sidebar view
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = searchQuery
      ? doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesView =
      sidebarView === "folder" && activeFolderId !== null
        ? doc.folderId === activeFolderId
        : true;
    return matchesSearch && matchesView;
  });

  // Load first doc on mount
  useEffect(() => {
    if (documents.length > 0 && activeDocId === null) {
      const first = documents[0];
      setActiveDocId(first.id);
      setEditorTitle(first.title);
      setEditorContent(first.content);
      setHasUnsaved(false);
    }
  }, [documents, activeDocId]);

  const handleSelectDoc = useCallback((doc: Document) => {
    setActiveDocId(doc.id);
    setEditorTitle(doc.title);
    setEditorContent(doc.content);
    setHasUnsaved(false);
  }, []);

  const handleNewDocument = useCallback(async () => {
    try {
      const title = `Untitled Document ${documents.length + 1}`;
      const id = await createDocument.mutateAsync({ title, content: "" });
      setActiveDocId(id);
      setEditorTitle(title);
      setEditorContent("");
      setHasUnsaved(false);
      toast.success("New document created");
    } catch {
      toast.error("Failed to create document");
    }
  }, [createDocument, documents.length]);

  const handleSave = useCallback(async () => {
    if (!activeDocId) return;
    try {
      await updateDocument.mutateAsync({
        id: activeDocId,
        title: editorTitle,
        content: editorContent,
      });
      setHasUnsaved(false);
      toast.success("Document saved");
    } catch {
      toast.error("Failed to save document");
    }
  }, [activeDocId, editorTitle, editorContent, updateDocument]);

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const activeDoc = documents.find((d) => d.id === activeDocId) ?? null;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "oklch(0.945 0.01 240)" }}
    >
      <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          documents={filteredDocs}
          allDocuments={documents}
          activeDocId={activeDocId}
          sidebarView={sidebarView}
          onSidebarViewChange={setSidebarView}
          onSelectDoc={handleSelectDoc}
          onNewDocument={handleNewDocument}
          isCreating={createDocument.isPending}
          isLoading={isLoading}
          activeFolderId={activeFolderId}
          onFolderSelect={(fid) => {
            setActiveFolderId(fid);
            setSidebarView("folder");
          }}
        />

        <EditorCenter
          activeDoc={activeDoc}
          title={editorTitle}
          content={editorContent}
          hasUnsaved={hasUnsaved}
          isSaving={updateDocument.isPending}
          onTitleChange={(t) => {
            setEditorTitle(t);
            setHasUnsaved(true);
          }}
          onContentChange={(c) => {
            setEditorContent(c);
            setHasUnsaved(true);
          }}
          onSave={handleSave}
          onShowVersionHistory={() => setShowVersionHistory(true)}
          showVersionHistory={showVersionHistory}
          onCloseVersionHistory={() => setShowVersionHistory(false)}
          onRestoreContent={(content, title) => {
            setEditorContent(content);
            setEditorTitle(title);
            setHasUnsaved(true);
            setShowVersionHistory(false);
          }}
        />

        <RightPanel activeDoc={activeDoc} />
      </div>
    </div>
  );
}
