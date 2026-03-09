# taskpack

Stop writing important prompts inside chat boxes.

`taskpack` gives each client task its own folder on disk: the prompt, the context,
the outputs, the diffs, the commands, and the links that prove what happened.

Write once in `prompt.md`. Use it in ChatGPT, Claude, Cursor, a CLI, or whatever
comes next. Come back a week later and the work is still there.

## Why it exists

Chat clients are great for running prompts and terrible for keeping them.

You write something careful, switch tools, lose the draft, forget which version
worked, or end up rebuilding context from old chat history. `taskpack` fixes that
by moving the important part out of the client and into plain files you control.

## What it does

- Creates a predictable task folder for each prompt-driven piece of work
- Keeps the prompt and supporting context in plain text
- Creates run folders for each attempt with a model or client
- Makes you save the receipts before closing a run
- Helps you resume work and search across old tasks later

## 60-second example

```bash
taskpack new "fix auth token refresh"
# Creates tasks/2026-03-03_fix-auth-token-refresh/

# Write the prompt in:
# tasks/2026-03-03_fix-auth-token-refresh/prompt.md

taskpack run tasks/2026-03-03_fix-auth-token-refresh --model claude-sonnet
# Creates a run folder with transcript.md, patch.diff, files_changed.txt, etc.

# Paste prompt.md into your client of choice.
# Paste the full response into transcript.md.
# Add the diff, files changed, commands, and any useful links.

taskpack close tasks/2026-03-03_fix-auth-token-refresh --run 001
# Validates that the run has real artifacts before closing it
```

## Before and after

Before:
- Important prompts live in chat history
- Good outputs are hard to compare across clients
- You remember what happened loosely, not exactly

After:
- The prompt has a home on disk
- Each run has its own folder
- The exact output, diff, commands, and links are kept together

## What gets saved

At the task level:
- `prompt.md` for the canonical prompt
- `context.md` for constraints, environment, and reference notes
- `outcomes.md` for acceptance criteria and results
- `decisions.md` for stable conclusions
- `links.md` for useful references
- `run.md` for model and run instructions

At the run level:
- `transcript.md` for the full output
- `patch.diff` for the actual diff
- `files_changed.txt` for exact paths
- `commands.log` for the commands you ran
- `pointers.json` for durable links and references
- `notes.md` for anything worth remembering

If a run matters, you should be able to open the folder and see exactly what was
asked, exactly what came back, and exactly what changed.

## Works with any client

`taskpack` does not call models. It just manages the files around the work.

Use it with:
- Chat apps
- IDE chat panes
- CLI tools
- API scripts
- Local models

## Installation

```bash
npm install -g taskpack
```

Or:

```bash
npx taskpack new "my-task"
```

Requires Node.js 18+.

## Quickstart

```bash
# 1. Create a task folder
taskpack new "migrate users to postgres"

# 2. Write the prompt and context

# 3. Create a run
taskpack run tasks/2026-03-03_migrate-users-to-postgres --model gpt-4o

# 4. Use the prompt in your preferred client

# 5. Paste the full output into transcript.md

# 6. Fill in patch.diff, files_changed.txt, commands.log, and pointers.json

# 7. Close the run
taskpack close tasks/2026-03-03_migrate-users-to-postgres --run 001

# 8. Resume later if needed
taskpack resume tasks/2026-03-03_migrate-users-to-postgres

# 9. Search old work
taskpack search "postgres"
```

## Folder shape

```text
tasks/
└── 2026-03-03_fix-auth-token-refresh/
    ├── prompt.md
    ├── context.md
    ├── outcomes.md
    ├── decisions.md
    ├── links.md
    ├── run.md
    ├── assets/
    └── runs/
        └── 001_claude-sonnet_20260303T101500Z/
            ├── transcript.md
            ├── patch.diff
            ├── files_changed.txt
            ├── commands.log
            ├── pointers.json
            └── notes.md
```

Everything is plain text. Everything is where you expect it to be. You can keep
the whole thing in git if you want.

See [docs/spec.md](./docs/spec.md) for the full folder spec.

## Commands

| Command | Description |
|---------|-------------|
| `taskpack new <name>` | Create a new task workspace |
| `taskpack run <task> -m <model> [--dry]` | Create a run stub |
| `taskpack close <task> --run <id>` | Validate required artifacts and close |
| `taskpack resume <task>` | Show status and next steps |
| `taskpack search <query>` | Search across all tasks |

Flags:
- `--model`, `-m` for the model name
- `--dry` to preview a run without writing files
- `--run` to choose which run to close

## Non-goals

`taskpack` is intentionally small.

It is not:
- an API wrapper
- an agent framework
- a hosted service
- a replacement for your favorite client

It is just a good place to keep the work.

## Contributing

Keep changes small, clear, and useful.

If you want to contribute:

```bash
npm install
npm run build
npm test
```

Focused PRs are easiest to review.

## License

[MIT](./LICENSE)
