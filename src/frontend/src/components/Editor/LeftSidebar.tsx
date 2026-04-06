import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  FileText,
  Folder,
  LayoutTemplate,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Document, DocumentId } from "../../backend";
import {
  useCreateFolder,
  useDeleteDocument,
  useGetUserFolders,
} from "../../hooks/useQueries";
import type { SidebarView } from "./EditorLayout";

interface LeftSidebarProps {
  documents: Document[];
  allDocuments: Document[];
  activeDocId: DocumentId | null;
  sidebarView: SidebarView;
  onSidebarViewChange: (v: SidebarView) => void;
  onSelectDoc: (doc: Document) => void;
  onNewDocument: () => void;
  isCreating: boolean;
  isLoading: boolean;
  activeFolderId: bigint | null;
  onFolderSelect: (folderId: bigint) => void;
}

const NAV_ITEMS: { id: SidebarView; label: string; icon: React.ElementType }[] =
  [
    { id: "all", label: "All Docs", icon: FileText },
    { id: "templates", label: "Templates", icon: LayoutTemplate },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

export default function LeftSidebar({
  documents,
  activeDocId,
  sidebarView,
  onSidebarViewChange,
  onSelectDoc,
  onNewDocument,
  isCreating,
  isLoading,
  activeFolderId,
  onFolderSelect,
}: LeftSidebarProps) {
  const { data: folders = [] } = useGetUserFolders();
  const deleteDocument = useDeleteDocument();
  const createFolder = useCreateFolder();
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);

  const handleDeleteDoc = async (id: DocumentId) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder.mutateAsync(newFolderName.trim());
      setNewFolderName("");
      setShowFolderInput(false);
      toast.success("Folder created");
    } catch {
      toast.error("Failed to create folder");
    }
  };

  return (
    <aside
      className="w-[260px] shrink-0 flex flex-col border-r border-border bg-sidebar h-full"
      data-ocid="sidebar.panel"
    >
      {/* Documents section header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "oklch(0.55 0.025 245)" }}
          >
            Documents
          </span>
          <button
            type="button"
            data-ocid="sidebar.new_doc.button"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent transition-colors"
            onClick={onNewDocument}
            disabled={isCreating}
            title="New document"
          >
            <Plus
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.44 0.065 245)" }}
            />
          </button>
        </div>

        {/* Nav items */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`sidebar.${item.id}.tab`}
              onClick={() => onSidebarViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors text-left",
                sidebarView === item.id
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-4 my-2 border-t border-border" />

      {/* Document list */}
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div
            className="px-2 space-y-2 py-2"
            data-ocid="sidebar.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 rounded-md" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 px-4 text-center"
            data-ocid="sidebar.empty_state"
          >
            <FileText
              className="w-8 h-8 mb-2"
              style={{ color: "oklch(0.75 0.02 245)" }}
            />
            <p className="text-xs" style={{ color: "oklch(0.6 0.02 245)" }}>
              No documents yet
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 py-1">
            {documents.map((doc, idx) => (
              // Use a group div with two focusable children instead of nested buttons
              <div
                key={doc.id.toString()}
                data-ocid={`sidebar.doc.item.${idx + 1}`}
                className={cn(
                  "group flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors",
                  activeDocId === doc.id ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                {/* Main clickable area */}
                <button
                  type="button"
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  onClick={() => onSelectDoc(doc)}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span
                    className={cn(
                      "flex-1 text-[13px] truncate",
                      activeDocId === doc.id
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {doc.title}
                  </span>
                </button>

                {/* Delete trigger – separate sibling button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      data-ocid={`sidebar.doc.delete_button.${idx + 1}`}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 shrink-0 flex items-center justify-center rounded hover:bg-destructive/10 transition-opacity"
                      title={`Delete ${doc.title}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="sidebar.delete.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete document?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{doc.title}" will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="sidebar.delete.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        data-ocid="sidebar.delete.confirm_button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        {/* Folders section */}
        <div className="mt-2">
          <div className="flex items-center justify-between px-2.5 py-1">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ color: "oklch(0.55 0.025 245)" }}
              onClick={() => setFoldersExpanded((p) => !p)}
            >
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  !foldersExpanded && "-rotate-90",
                )}
              />
              Folders
            </button>
            <button
              type="button"
              data-ocid="sidebar.new_folder.button"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent transition-colors"
              onClick={() => setShowFolderInput((p) => !p)}
              title="New folder"
            >
              <Plus
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.44 0.065 245)" }}
              />
            </button>
          </div>

          {showFolderInput && (
            <div className="px-2 pb-1">
              <input
                data-ocid="sidebar.folder.input"
                className="w-full px-2 py-1.5 text-[13px] border border-border rounded-md bg-white outline-none focus:ring-1 ring-primary/40"
                placeholder="Folder name…"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setShowFolderInput(false);
                }}
              />
            </div>
          )}

          {foldersExpanded && (
            <div className="space-y-0.5">
              {folders.length === 0 ? (
                <p
                  className="px-3 py-2 text-[12px]"
                  style={{ color: "oklch(0.65 0.015 245)" }}
                >
                  No folders
                </p>
              ) : (
                folders.map((folder, idx) => (
                  <button
                    type="button"
                    key={folder.id.toString()}
                    data-ocid={`sidebar.folder.item.${idx + 1}`}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors text-left",
                      activeFolderId === folder.id
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <Folder className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom CTA */}
      <div className="p-3 border-t border-border">
        <Button
          data-ocid="sidebar.new_document.primary_button"
          className="w-full h-9 text-[13px] font-semibold btn-new-doc rounded-lg"
          onClick={onNewDocument}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Document
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
