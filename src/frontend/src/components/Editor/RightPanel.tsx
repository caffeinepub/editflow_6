import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Document } from "../../backend";

interface RightPanelProps {
  activeDoc: Document | null;
}

const COLLABORATORS = [
  { initials: "AL", name: "Alice L.", color: "oklch(0.6 0.14 220)" },
  { initials: "BM", name: "Bob M.", color: "oklch(0.55 0.14 150)" },
  { initials: "CK", name: "Carol K.", color: "oklch(0.58 0.14 30)" },
];

const COMMENTS = [
  {
    id: "comment-1",
    author: "Alice L.",
    initials: "AL",
    color: "oklch(0.6 0.14 220)",
    text: "Great opening paragraph! The flow is really smooth here.",
    time: "2 hours ago",
  },
  {
    id: "comment-2",
    author: "Bob M.",
    initials: "BM",
    color: "oklch(0.55 0.14 150)",
    text: "Can we expand the conclusion section a bit more?",
    time: "Yesterday",
  },
];

export default function RightPanel({ activeDoc }: RightPanelProps) {
  return (
    <aside
      className="w-[240px] shrink-0 border-l border-border bg-white flex flex-col"
      data-ocid="right_panel.panel"
    >
      <ScrollArea className="flex-1">
        {/* Collaborators */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users
              className="w-4 h-4"
              style={{ color: "oklch(0.44 0.065 245)" }}
            />
            <h3
              className="text-[13px] font-semibold"
              style={{ color: "oklch(0.28 0.05 245)" }}
            >
              Collaborators
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLLABORATORS.map((c) => (
              <motion.div
                key={c.name}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Avatar className="w-8 h-8 cursor-pointer" title={c.name}>
                  <AvatarFallback
                    className="text-[11px] font-bold text-white"
                    style={{ background: c.color }}
                  >
                    {c.initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
            <button
              type="button"
              data-ocid="right_panel.add_collaborator.button"
              className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center hover:border-primary transition-colors"
              style={{ borderColor: "oklch(0.82 0.015 240)" }}
              title="Add collaborator"
            >
              <span
                className="text-[14px]"
                style={{ color: "oklch(0.65 0.02 245)" }}
              >
                +
              </span>
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare
              className="w-4 h-4"
              style={{ color: "oklch(0.44 0.065 245)" }}
            />
            <h3
              className="text-[13px] font-semibold"
              style={{ color: "oklch(0.28 0.05 245)" }}
            >
              Comments
            </h3>
            <span
              className="ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.94 0.018 240)",
                color: "oklch(0.44 0.065 245)",
              }}
            >
              {activeDoc ? COMMENTS.length : 0}
            </span>
          </div>

          {activeDoc ? (
            <div className="space-y-4" data-ocid="right_panel.comments.list">
              {COMMENTS.map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  className="flex gap-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.25 }}
                  data-ocid={`right_panel.comment.item.${idx + 1}`}
                >
                  <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                    <AvatarFallback
                      className="text-[9px] font-bold text-white"
                      style={{ background: comment.color }}
                    >
                      {comment.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: "oklch(0.28 0.04 245)" }}
                      >
                        {comment.author}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: "oklch(0.62 0.018 245)" }}
                      >
                        {comment.time}
                      </span>
                    </div>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "oklch(0.42 0.025 245)" }}
                    >
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="py-6 text-center"
              data-ocid="right_panel.comments.empty_state"
            >
              <MessageSquare
                className="w-6 h-6 mx-auto mb-1.5"
                style={{ color: "oklch(0.75 0.015 245)" }}
              />
              <p
                className="text-[12px]"
                style={{ color: "oklch(0.62 0.02 245)" }}
              >
                No document selected
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p
          className="text-[10px] text-center"
          style={{ color: "oklch(0.65 0.015 245)" }}
        >
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
