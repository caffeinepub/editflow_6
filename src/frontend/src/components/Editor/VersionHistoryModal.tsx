import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { History, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import type { DocumentId } from "../../backend";
import { useGetDocumentHistory } from "../../hooks/useQueries";

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  documentId: DocumentId;
  documentTitle: string;
  onRestore: (content: string, title: string) => void;
}

export default function VersionHistoryModal({
  open,
  onClose,
  documentId,
  documentTitle,
  onRestore,
}: VersionHistoryModalProps) {
  const { data: history = [], isLoading } = useGetDocumentHistory(
    open ? documentId : null,
  );

  const handleRestore = (content: string) => {
    onRestore(content, documentTitle);
    toast.success("Version restored — remember to save!");
  };

  const formatDate = (savedAt: bigint) => {
    try {
      // IC time is in nanoseconds
      const ms = Number(savedAt / BigInt(1_000_000));
      return format(new Date(ms), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" data-ocid="version_history.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <History
              className="w-4 h-4"
              style={{ color: "oklch(0.44 0.065 245)" }}
            />
            Version History
          </DialogTitle>
        </DialogHeader>

        <p
          className="text-[13px] -mt-1"
          style={{ color: "oklch(0.55 0.025 245)" }}
        >
          {documentTitle}
        </p>

        <ScrollArea className="max-h-[360px] pr-2">
          {isLoading ? (
            <div
              className="space-y-3 py-2"
              data-ocid="version_history.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div
              className="py-8 text-center"
              data-ocid="version_history.empty_state"
            >
              <History
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "oklch(0.75 0.015 245)" }}
              />
              <p className="text-sm" style={{ color: "oklch(0.58 0.025 245)" }}>
                No versions saved yet
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.68 0.015 245)" }}
              >
                Save your document to start tracking versions
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-1">
              {history.map((version, idx) => (
                <div
                  key={version.versionId.toString()}
                  data-ocid={`version_history.version.item.${idx + 1}`}
                  className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: "oklch(0.28 0.04 245)" }}
                    >
                      Version {history.length - idx}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: "oklch(0.58 0.025 245)" }}
                    >
                      {formatDate(version.savedAt)}
                    </p>
                  </div>
                  <Button
                    data-ocid={`version_history.restore.button.${idx + 1}`}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[12px]"
                    onClick={() => handleRestore(version.content)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-1">
          <Button
            data-ocid="version_history.close_button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-[13px]"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
