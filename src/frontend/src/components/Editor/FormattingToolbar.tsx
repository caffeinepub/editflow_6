import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import type { RefObject } from "react";

interface FormattingToolbarProps {
  editorRef: RefObject<HTMLDivElement | null>;
}

const FONTS = [
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Georgia", label: "Georgia" },
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
];

const SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
  "32",
  "36",
  "48",
  "60",
  "72",
];

function execFmt(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

interface ToolbarBtnProps {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  ocid?: string;
}

function ToolbarBtn({ icon: Icon, title, onClick, ocid }: ToolbarBtnProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-ocid={ocid}
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              onClick();
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors"
            style={{ color: "oklch(0.42 0.035 245)" }}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function FormattingToolbar({
  editorRef,
}: FormattingToolbarProps) {
  const focusEditor = () => editorRef.current?.focus();

  const handleLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      focusEditor();
      execFmt("createLink", url);
    }
  };

  const handleImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      focusEditor();
      execFmt("insertImage", url);
    }
  };

  return (
    <div
      className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-white shrink-0 flex-wrap"
      data-ocid="editor.toolbar.panel"
    >
      {/* Font family */}
      <Select
        onValueChange={(val) => {
          focusEditor();
          execFmt("fontName", val);
        }}
      >
        <SelectTrigger
          data-ocid="editor.font.select"
          className="h-7 w-36 text-[12px] border-border bg-white rounded"
        >
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((f) => (
            <SelectItem key={f.value} value={f.value} className="text-[12px]">
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font size */}
      <Select
        onValueChange={(val) => {
          focusEditor();
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const span = document.createElement("span");
            span.style.fontSize = `${val}px`;
            try {
              range.surroundContents(span);
            } catch {
              span.appendChild(range.extractContents());
              range.insertNode(span);
            }
          }
        }}
      >
        <SelectTrigger
          data-ocid="editor.font_size.select"
          className="h-7 w-16 text-[12px] border-border bg-white rounded"
        >
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {SIZES.map((s) => (
            <SelectItem key={s} value={s} className="text-[12px]">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <ToolbarBtn
        icon={Bold}
        title="Bold (Ctrl+B)"
        ocid="editor.bold.toggle"
        onClick={() => {
          focusEditor();
          execFmt("bold");
        }}
      />
      <ToolbarBtn
        icon={Italic}
        title="Italic (Ctrl+I)"
        ocid="editor.italic.toggle"
        onClick={() => {
          focusEditor();
          execFmt("italic");
        }}
      />
      <ToolbarBtn
        icon={Underline}
        title="Underline (Ctrl+U)"
        ocid="editor.underline.toggle"
        onClick={() => {
          focusEditor();
          execFmt("underline");
        }}
      />

      {/* Text color */}
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors cursor-pointer">
              <span
                className="text-[11px] font-bold pointer-events-none"
                style={{ color: "oklch(0.42 0.035 245)" }}
              >
                A
              </span>
              <input
                data-ocid="editor.text_color.input"
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Text Color"
                onChange={(e) => {
                  focusEditor();
                  execFmt("foreColor", e.target.value);
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Text Color
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <ToolbarBtn
        icon={AlignLeft}
        title="Align Left"
        ocid="editor.align_left.toggle"
        onClick={() => {
          focusEditor();
          execFmt("justifyLeft");
        }}
      />
      <ToolbarBtn
        icon={AlignCenter}
        title="Align Center"
        ocid="editor.align_center.toggle"
        onClick={() => {
          focusEditor();
          execFmt("justifyCenter");
        }}
      />
      <ToolbarBtn
        icon={AlignRight}
        title="Align Right"
        ocid="editor.align_right.toggle"
        onClick={() => {
          focusEditor();
          execFmt("justifyRight");
        }}
      />
      <ToolbarBtn
        icon={AlignJustify}
        title="Justify"
        ocid="editor.align_justify.toggle"
        onClick={() => {
          focusEditor();
          execFmt("justifyFull");
        }}
      />

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <ToolbarBtn
        icon={List}
        title="Bullet List"
        ocid="editor.bullet_list.toggle"
        onClick={() => {
          focusEditor();
          execFmt("insertUnorderedList");
        }}
      />
      <ToolbarBtn
        icon={ListOrdered}
        title="Numbered List"
        ocid="editor.numbered_list.toggle"
        onClick={() => {
          focusEditor();
          execFmt("insertOrderedList");
        }}
      />

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <ToolbarBtn
        icon={Link2}
        title="Insert Link"
        ocid="editor.link.button"
        onClick={handleLink}
      />
      <ToolbarBtn
        icon={Image}
        title="Insert Image"
        ocid="editor.image.button"
        onClick={handleImage}
      />
    </div>
  );
}
