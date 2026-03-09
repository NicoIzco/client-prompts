# taskpack — Folder Specification

## Overview

A **task workspace** is a folder on disk that contains everything needed to
write, run, and audit an LLM-assisted task. The CLI (`taskpack`) is a runner
that scaffolds, validates, and searches these workspaces.

## Folder anatomy

```
tasks/
└── 2026-03-03_fix-foo/
    ├── prompt.md            # Canonical prompt (human-authored)
    ├── context.md           # Environment, constraints, prior art
    ├── outcomes.md          # Acceptance criteria + post-run results
    ├── decisions.md         # Stable conclusions across runs
    ├── links.md             # Hard pointers — commits, PRs, file paths
    ├── run.md               # Model, temperature, run instructions
    ├── assets/              # Screenshots, data files, references
    └── runs/
        └── 001_opus_20260303T101500Z/
            ├── transcript.md      # Full model output
            ├── patch.diff         # Code diff from this run
            ├── files_changed.txt  # List of files touched
            ├── commands.log       # Commands executed
            ├── pointers.json      # Machine-readable hard pointers
            └── notes.md           # Human observations
```

## File purposes

### Task-level files

| File | Purpose | Author |
|------|---------|--------|
| `prompt.md` | The single source of truth for the task. One task, one prompt. | Human |
| `context.md` | Environment details, dependencies, related files. Survives across sessions. | Human |
| `outcomes.md` | Define "done" before starting. Results appended after each run. | Human + CLI |
| `decisions.md` | Stable conclusions that should not be revisited unless reopened. | Human + CLI |
| `links.md` | Hard pointers — permanent references that prevent summary rot. | Human + CLI |
| `run.md` | Model selection, temperature, special instructions for the runner. | Human |

### Run-level files

| File | Purpose | Author |
|------|---------|--------|
| `transcript.md` | Full model output, pasted verbatim. | Human (paste) |
| `patch.diff` | The actual code diff produced by this run. | Human / tool |
| `files_changed.txt` | List of files touched during the run. | Human / tool |
| `commands.log` | Commands executed during the run. | Human / tool |
| `pointers.json` | Machine-readable array of hard pointers (URLs, hashes, paths). | Human / tool |
| `notes.md` | Free-form observations, surprises, follow-ups. | Human |

## Hard pointers

"Hard pointers" are references that don't decay:

- **Commit hashes**: `a1b2c3d`
- **PR/MR URLs**: `https://github.com/org/repo/pull/42`
- **File paths**: `src/auth/login.ts:45`
- **Command outputs**: Exact commands with their output
- **Diff content**: The actual patch, not a summary of it

Summaries rot. Pointers don't. Every closed run must have its hard pointers
validated (or explicitly marked `N/A`).

## `pointers.json` schema

```json
[
  {
    "type": "commit",
    "value": "a1b2c3d4e5f6",
    "description": "Fixed auth token refresh"
  },
  {
    "type": "url",
    "value": "https://github.com/org/repo/pull/42",
    "description": "PR for the fix"
  },
  {
    "type": "file",
    "value": "src/auth/login.ts:45",
    "description": "Changed token refresh logic"
  }
]
```

Supported `type` values: `commit`, `url`, `file`, `command`, `other`.

## CLI commands

| Command | Description |
|---------|-------------|
| `taskpack new <name>` | Create a new task workspace |
| `taskpack run <task> --model <name> [--dry]` | Create a run stub |
| `taskpack close <task> --run <id>` | Validate pointers and close a run |
| `taskpack resume <task>` | Show task status and next steps |
| `taskpack search <query>` | Search across all tasks |

## Design principles

1. **Files are the API.** No database, no config server. Everything is readable
   plain text in a predictable folder structure.
2. **Works with any LLM.** The CLI doesn't call models — it scaffolds
   workspaces. Use any client, any model, any workflow.
3. **Hard pointers over summaries.** Summaries decay. Links, hashes, and diffs
   are permanent.
4. **Progressive disclosure.** The folder spec is useful even without the CLI.
   The CLI just makes it faster.
5. **Cross-platform.** macOS, Linux, Windows. No shell-specific tricks.
