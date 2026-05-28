# Claude to Claude Account Migration Assistant

A browser-based tool for migrating Claude accounts between workspaces (e.g. personal to team, or Team to Enterprise). Built for the Mindgruve and Moontide Agency teams.

**Live tool:** https://angeleenmcw.github.io/claude-migration-assistant/

---

## What it does

When switching Claude accounts, you lose conversation history, memory, projects, and artifacts. This tool automates the migration process using the Anthropic API — no manual copy-pasting into Claude required.

It walks you through 10 steps across two tracks:

**Track A — Export processing**
- A1: Choose your export type (personal or admin team)
- A2: Upload and process your export file
- A3: AI generates a context document from your conversation history
- A4: AI identifies and categorizes critical artifacts to preserve

**Track B — AI-powered migration**
- B1: AI generates a complete memory profile from your data
- B2: AI creates structured blueprints for each project
- B3: AI generates a ready-to-paste memory restore prompt
- B4: AI produces step-by-step project recreation guides
- B5: Manual checklist for re-uploading critical files
- B6: AI generates a validation report and migration completion summary

---


- **Anthropic API automation** — every manual "copy this prompt into Claude" step is replaced with a Generate button that calls the API and returns output inline

---

## Getting started

No install or build step needed. Just serve the files:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## How to use it

**For individual users**
1. Go to Claude Settings → Privacy → Export Data
2. Download the ZIP
3. Open the tool and follow Track A → Track B

**For team admins**
1. Export team data from the Claude admin console
2. Upload the JSON files (conversations, users, memories, projects)
3. Select a team member and run through both tracks

---

## Project structure

```
index.html          # App shell — loads React, Babel, Tabler Icons via CDN
css/
  variables.css     # Design tokens (light + dark mode)
  layout.css        # App shell layout
  components.css    # UI component styles
js/
  app.jsx           # Full React app — all steps, state, and API calls
```

---

## Privacy

All processing happens in your browser. The tool:

- Does not store or transmit your export data
- Only sends conversation snippets to the Anthropic API when you click Generate
- Stores step completion state in memory only (resets on refresh)

---

## Tech stack

- React 18 (via CDN, no build step)
- Babel Standalone (JSX transpilation in browser)
- Tabler Icons webfont
- Anthropic Messages API (`claude-sonnet-4-20250514`)

---

MIT license.
