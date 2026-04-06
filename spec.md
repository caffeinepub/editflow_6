# EditFlow

## Current State
New project with empty backend and no frontend implementation.

## Requested Changes (Diff)

### Add
- Full-featured web-based document editing application
- Document management: create, rename, delete, list documents
- Rich text editor with formatting toolbar (bold, italic, underline, font size, alignment, lists)
- Document sidebar with navigation sections (All Docs, Templates, Trash, Folders)
- Collaborators panel (UI placeholder)
- Comments panel (UI placeholder)
- Document title editing
- Save, Export (text download), and Share (copy link) actions
- Version history tracking (store timestamps of saves)
- Search documents functionality

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Document CRUD (create, read, update, delete), version history per document, search by title
2. Frontend: Three-column layout matching the design preview — sidebar, editor, right panel
3. Rich text editing using contenteditable div with execCommand-based formatting toolbar
4. Wire all backend calls: load documents on mount, save on button click, create/delete documents
5. State management for active document, editor content, formatting state
