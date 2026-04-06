# EditFlow

## Current State
EditFlow is a full document editor with:
- Fixed 260px left sidebar (document list, folders, nav)
- Fixed editor center with title bar, formatting toolbar, content canvas
- Fixed 240px right panel (collaborators, comments)
- TopNav with search, nav links, user menu
- Download button in the editor title bar (desktop only accessible)
- No mobile responsiveness — sidebars always visible, layout breaks on small screens

## Requested Changes (Diff)

### Add
- Mobile-responsive layout: on small screens (< md), show only the editor center by default; sidebar and right panel accessible via drawer/sheet overlays or bottom nav
- A floating/accessible download button on mobile (e.g. in a mobile toolbar or bottom bar)
- Hamburger/menu button in TopNav on mobile to open the left sidebar sheet
- A mobile bottom bar or floating action area with key actions: New Doc, Download, Version History

### Modify
- `EditorLayout.tsx`: add mobile state for sidebar and right panel open/close; render LeftSidebar inside a Sheet on mobile
- `TopNav.tsx`: add hamburger button on mobile to toggle sidebar; hide nav links on mobile
- `EditorCenter.tsx`: ensure the title bar action buttons are scrollable or collapsed into a dropdown on very small screens so Download is always reachable
- `LeftSidebar.tsx`: work both as a fixed sidebar (desktop) and as content inside a Sheet (mobile)
- `RightPanel.tsx`: hide on mobile or make it accessible via a button

### Remove
- Nothing removed

## Implementation Plan
1. Modify `EditorLayout.tsx` to manage `mobileLeftOpen` and `mobileRightOpen` state; wrap LeftSidebar in a Sheet component on mobile
2. Modify `TopNav.tsx` to add a hamburger Menu button on mobile that calls `onMobileMenuOpen` prop
3. Modify `EditorCenter.tsx` to wrap the action buttons row in a horizontally scrollable container on mobile, or collapse Save/Share/Version History into a dropdown on small screens, keeping Download prominent
4. Ensure the entire layout uses responsive Tailwind classes so the sidebar is hidden on mobile (hidden md:flex) and the editor takes full width
5. Add a minimal mobile floating bar at the bottom of the editor for quick access to Download
