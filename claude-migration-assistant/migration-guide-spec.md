# Claude Account Migration Guide — Spec

## Purpose

Step-by-step guide for migrating a user's Claude data from one account to another (e.g., Team → Enterprise). Designed to be built as an interactive webapp.

---

## What Transfers and How

| Data | Source | Fidelity | Method |
|---|---|---|---|
| Conversation text | Export JSON | ✅ Exact copy (read-only archive) | Script parses `conversations.json` |
| Artifact source code | Export JSON | ✅ Exact copy (as files) | Script extracts `<antArtifact>` blocks from message content |
| Artifact rendering | — | ❌ Does not transfer | Artifacts must be re-created in new account to be interactive |
| Memory (synthesized) | Old account chat | ⚠️ Approximate | User asks Claude to dump memories; paste into new account |
| Memory edits (30 slots) | Old account chat | ⚠️ Approximate | User asks Claude to list edits; re-add in new account |
| Project structure | Manual capture | ⚠️ Approximate | User copies custom instructions + uploads knowledge files manually |
| Project knowledge files | Manual download | ✅ Exact if user has originals | Re-upload to new project |
| Custom instructions | Manual capture | ✅ Exact if copied verbatim | Copy/paste from old project settings |
| Conversation search | — | ❌ Does not transfer | New account has no history to search |
| Style preferences | — | ❌ Does not transfer | Must reconfigure in new account settings |
| Feature toggles | — | ❌ Does not transfer | Must reconfigure in new account settings |

### Key Constraints

- Export is all-or-nothing. No selective conversation export.
- Memory system: 30 edits max, 200 characters each.
- Accounts with the same email cannot merge. They remain separate.
- Deleted conversations are not in the export.
- Project structure (the container) does not export. Only contents do.
- There is no API for importing conversations, memory, or projects.

---

## Prerequisites

1. Access to old Claude account (source)
2. Access to new Claude account (target)
3. Native data export completed: Settings → Privacy → Export Data → download ZIP

---

## Track A: Automated (Browser Processes Export JSON)

The webapp takes the native export ZIP as input and produces organized, usable outputs. Everything runs client-side — no server, no data leaves the machine.

### A1. Run native data export

1. Old account → Settings → Privacy → Export Data
2. Wait for email (minutes to hours)
3. Download ZIP

### A2. Upload ZIP to webapp

Drag the ZIP into the webapp. It processes `conversations.json` client-side using JSZip and produces:

```
migration-package/
├── summary.md                    # Migration report: stats, top conversations, gaps
├── conversations/
│   ├── index.json                # All conversations: id, title, date, message count
│   ├── recent/                   # Last 90 days, full markdown
│   │   ├── [title-1].md
│   │   └── ...
│   └── archive/                  # Older, full markdown
│       └── ...
├── artifacts/
│   ├── index.json                # All artifacts: id, type, title, source conversation
│   ├── [artifact-1].jsx          # Extracted source files
│   ├── [artifact-2].html
│   ├── [artifact-3].py
│   └── ...
├── context-document.md           # Auto-generated onboarding doc (see A3)
└── memory-import-script.txt      # Paste-ready memory commands (see B3)
```

### A3. Auto-generated context document

The script analyzes all conversations and produces `context-document.md` containing:

- Most frequently discussed topics (by keyword frequency across conversations)
- Projects mentioned by name
- Tools, technologies, and frameworks mentioned
- Recurring patterns (e.g., "user often asks for markdown output")
- Summary of the 20 most recent substantive conversations

This document is uploaded to the new account in Track B.

**Fidelity note:** This is machine-generated from conversation text only. It does not capture Claude's synthesized understanding, implicit preferences, or memory. It supplements — does not replace — Track B.

### A4. Review outputs

1. Open `summary.md` — check conversation count, artifact count, date range
2. Scan `artifacts/index.json` — verify important artifacts were extracted
3. Read `context-document.md` — edit for accuracy, add anything missing
4. Identify which artifacts and conversations matter most for restoration

---

## Track B: Manual (Prompt-Based, In-Chat)

These steps require the user to interact with Claude in both old and new accounts. Cannot be automated — the data lives in Anthropic's backend, not in the export.

### B1. Capture memory from old account

Open a new conversation in the **old account**. Send:

```
I'm migrating to a new Claude account. Please create a markdown 
file called memory-capture.md containing:

1. Your complete memory of me — verbatim, exactly as stored
2. All memory edits I've made — numbered, exact text
3. My work context: role, company, team, projects
4. My communication preferences: tone, format, length
5. Technical domains and tools I work with
6. Recurring workflows or patterns in how I use you
7. Anything else that helps you work effectively with me

Be exhaustive.
```

Download the generated file.

### B2. Capture project blueprints from old account

For each Project in the old account, open a conversation **within that project** and send:

```
I'm migrating to a new Claude account. Please create a markdown 
file called project-blueprint.md containing:

1. Project name
2. The full custom instructions for this project (verbatim)
3. A list of all knowledge files uploaded to this project 
   (filenames and brief description of each)
4. Summary of what we've worked on: key decisions, current status, 
   important context, and any preferences specific to this project

Be exhaustive.
```

Download the generated file. Rename to `project-[name]-blueprint.md`.

Also download or locate the original knowledge files — these must be re-uploaded manually in B4.

### B3. Restore memory in new account

Open a new conversation in the **new account**. 

**Step 1 — Bulk context seeding:**

Upload `context-document.md` (from Track A) and `memory-capture.md` (from B1). Send:

```
I'm migrating from a previous Claude account. These two documents 
capture my profile, preferences, projects, and working patterns.

Please:
1. Read both documents carefully
2. Add the most important facts into your memory using the memory 
   edit tool. Prioritize: role/company, active projects, 
   communication preferences, key technical context.
3. List what you stored.
```

**Step 2 — Specific memory edits:**

If the migration script produced `memory-import-script.txt`, paste the commands in batches:

```
Please remember: [edit 1]
Please remember: [edit 2]
...
```

Note: Only 30 memory edit slots are available. Prioritize edits that capture information NOT already in Claude's synthesized memory.

### B4. Recreate projects in new account

For each project blueprint from B2:

1. Create new Project in new account
2. Open the blueprint file — copy the custom instructions into project settings
3. Upload the original knowledge files
4. Start a conversation in the project. Upload the blueprint file and send:

```
This is the context from a previous account's version of this 
project. Please familiarize yourself with it.
```

### B5. Upload critical artifacts

For artifacts identified as important in A4:

1. Upload the extracted artifact files to the relevant Project's knowledge base
2. Or reference them in conversation as needed

Artifacts will exist as static files. They will not be interactive/rendered until re-created in a new conversation.

### B6. Validate

In the new account, send:

```
Based on everything you know about me, tell me:
- Who I am and what I do
- What projects or topics are top of mind for me  
- How I prefer to communicate
- Any tools, frameworks, or domains I work in
- Anything else you consider important context

Be thorough — I'm checking that migration was successful.
```

Compare against `memory-capture.md` from B1. Fix gaps by adding memory edits or uploading additional context.

---

## Webapp Feature Spec

The guide above should be built as a single-page web app with the following features:

### Layout

- Left sidebar: step list with checkboxes (Track A, Track B)
- Main area: current step instructions
- Steps can be expanded/collapsed
- Progress bar at top

### Interactive Elements

| Step | Interactive feature |
|---|---|
| A1 | Link to Claude settings page; "done" checkbox |
| A2 | Drop zone for ZIP; processing progress bar; output preview |
| A3 | Rendered preview of context-document.md with edit capability |
| A4 | Checklist of artifacts with "important" toggle |
| B1 | Copyable prompt block; upload zone for memory-capture.md |
| B2 | Copyable prompt block; repeatable project card: name, upload blueprint file, upload knowledge files |
| B3 | Copyable prompt blocks; memory edit queue with send/skip per item |
| B4 | Project list from B2 with "recreated" checkbox per project |
| B5 | Artifact list from A4 (filtered to important), with "uploaded" checkbox |
| B6 | Copyable validation prompt; pass/fail toggle |

### Data Handling

- All data stays in browser (localStorage or IndexedDB)
- ZIP file processed client-side with JSZip
- No server component. No data leaves the user's machine.
- Export progress as JSON for resume later

### Processing Engine (JavaScript, client-side)

- JSZip to read the export ZIP
- Parse `conversations.json` directly
- Extract `<antArtifact>` blocks with regex (content isn't valid XML)
- Generate markdown conversation files with metadata headers
- Produce `context-document.md` via keyword/topic extraction
- Produce `memory-import-script.txt` by extracting likely memory-worthy facts
- Download outputs as ZIP or display inline

---

## Timeline per User

| Phase | Time | Steps |
|---|---|---|
| Export (old account) | 30 min | A1, B1, B2 |
| Processing | 15 min | A2, A3, A4 |
| Import (new account) | 45 min | B3, B4, B5 |
| Validation | 15 min | B6 |
| **Total** | **~1.5–2 hours** | |

---

## Post-Migration

- Keep old account accessible (read-only) for 30 days as reference
- After 1 week of use in new account, run B6 validation again to catch drift
- Report persistent gaps — some may require additional memory edits or context uploads
