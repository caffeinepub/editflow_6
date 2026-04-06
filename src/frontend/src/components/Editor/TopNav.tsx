import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, FileText, Menu, Search } from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onMobileMenuOpen?: () => void;
}

const NAV_LINKS = ["Dashboard", "Recent", "Shared", "Settings"];

export default function TopNav({
  searchQuery,
  onSearchChange,
  onMobileMenuOpen,
}: TopNavProps) {
  const { identity, clear } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "";
  const initials = principal ? principal.slice(0, 2).toUpperCase() : "U";

  return (
    <header
      className="flex items-center h-[52px] px-4 gap-3 border-b border-border shrink-0 bg-white"
      style={{ boxShadow: "0 1px 3px rgba(47,78,107,0.07)" }}
    >
      {/* Mobile hamburger — only on small screens */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden w-8 h-8 shrink-0"
        onClick={onMobileMenuOpen}
        data-ocid="nav.mobile_menu.button"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" style={{ color: "oklch(0.42 0.03 245)" }} />
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: "oklch(0.37 0.065 245)" }}
        >
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ color: "oklch(0.28 0.065 245)" }}
        >
          EditFlow
        </span>
      </div>

      {/* Nav links — desktop only */}
      <nav className="hidden md:flex items-center gap-0.5 ml-2">
        {NAV_LINKS.map((link) => (
          <button
            type="button"
            key={link}
            data-ocid={`nav.${link.toLowerCase()}.link`}
            className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors hover:bg-accent"
            style={{ color: "oklch(0.42 0.03 245)" }}
          >
            {link}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "oklch(0.6 0.02 245)" }}
          />
          <Input
            data-ocid="nav.search_input"
            className="pl-8 h-8 text-[13px] bg-secondary border-border rounded-lg"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          data-ocid="nav.notifications.button"
        >
          <Bell className="w-4 h-4" style={{ color: "oklch(0.5 0.025 245)" }} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="nav.user.button"
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  className="text-[11px] font-bold text-white"
                  style={{ background: "oklch(0.44 0.08 245)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden sm:block text-[13px] font-medium"
                style={{ color: "oklch(0.35 0.04 245)" }}
              >
                {principal ? `${principal.slice(0, 8)}…` : "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              data-ocid="nav.logout.button"
              onClick={clear}
              className="text-sm cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
