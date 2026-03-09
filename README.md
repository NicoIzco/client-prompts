# taskpack

> **Your prompts deserve a home.** Stop losing drafts to interruptions and context to model switches — taskpack gives every LLM task a workspace on disk.

<!-- badges -->
[![npm version](https://img.shields.io/npm/v/taskpack)](https://www.npmjs.com/package/taskpack)
[![license](https://img.shields.io/npm/l/taskpack)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/yourorg/taskpack/ci.yml)](https://github.com/yourorg/taskpack/actions)

---

<!-- GIF demo placeholder -->
<p align="center">
  <em>[ demo GIF here — <code>taskpack new</code> → edit prompt → <code>taskpack run</code> → paste output → <code>taskpack close</code> ]</em>
</p>

---

## 20-second pitch

```bash
taskpack new "fix auth token refresh"
# → creates tasks/2026-03-03_fix-auth-token-refresh/ with prompt.md, context.md, etc.

# Write your prompt in prompt.md. Take your time. Get interrupted. Come back. It's still there.

taskpack run tasks/2026-03-03_fix-auth-token-refresh --model claude-sonnet
# → creates runs/001_claude-sonnet_<timestamp>/ with placeholders for output

# Paste the model's response into transcript.md. Add the diff. Log what you ran.

taskpack close tasks/2026-03-03_fix-auth-token-refresh --run 001
# → validates hard pointers exist, closes the run. Nothing lost. Nothing summarized away.
```

## Why this exists

**Scenario 1: The interrupted prompt.**
You're 15 minutes into crafting the perfect prompt in your chat window. Slack pings. You switch tabs. The browser refreshes. Your draft is gone.

**Scenario 2: The lost context.**
You ran a task with GPT-4. Got a great result. Now you want to try Claude. But the original prompt is buried in a chat log, the screenshot you referenced is gone, and you're reconstructing from memory.

taskpack fixes both by making **the filesystem your workspace**. Prompts live in files. Results go into structured folders. Everything is plain text, version-controllable, and permanent.

## Anti-summary-rot

Most tools save "summaries" of what happened. Summaries decay — they lose detail, miss edge cases, and become unreliable over time.

taskpack enforces **hard pointers** instead:

| Instead of... | taskpack uses... |
|---------------|------------------|
| "Fixed the auth bug" | `patch.diff` with the actual code change |
| "Changed some files" | `files_changed.txt` with exact paths |
| "Ran some commands" | `commands.log` with exact commands |
| "It's in the PR somewhere" | `pointers.json` with the PR URL |

When you run `taskpack close`, it **validates** that these pointers exist. No empty artifacts. No hand-waving. Either you have the receipts or you mark it `N/A` intentionally.

## Works with any LLM / client

taskpack doesn't call models. It doesn't care if you use ChatGPT, Claude, Gemini, a local model, or a pen and paper. It's a **workspace manager**, not an API wrapper.

Use it with:
- Chat UIs (ChatGPT, Claude.ai, etc.)
- CLI tools (aichat, llm, sgpt, etc.)
- IDE extensions (Cursor, Copilot, etc.)
- API scripts
- MCP servers (optional adapter planned)

## Installation

```bash
npm install -g taskpack
```

Or use it without installing:

```bash
npx taskpack new "my-task"
```

**Requires Node.js 18+.**

## Quickstart

```bash
# 1. Create a task
taskpack new "migrate users to postgres"

# 2. Write your prompt
$EDITOR tasks/2026-03-03_migrate-users-to-postgres/prompt.md

# 3. Create a run
taskpack run tasks/2026-03-03_migrate-users-to-postgres --model gpt-4o

# 4. Run your prompt with your preferred tool, paste output
$EDITOR tasks/2026-03-03_migrate-users-to-postgres/runs/001_gpt-4o_*/transcript.md

# 5. Fill in artifacts (diff, files changed, etc.)

# 6. Close the run
taskpack close tasks/2026-03-03_migrate-users-to-postgres --run 001

# 7. Lost your place? Resume.
taskpack resume tasks/2026-03-03_migrate-users-to-postgres

# 8. Find something across all tasks
taskpack search "postgres"
```

## Folder anatomy

```
tasks/
└── 2026-03-03_fix-auth-token-refresh/
    ├── prompt.md              ← Your canonical prompt
    ├── context.md             ← Environment & constraints
    ├── outcomes.md            ← Acceptance criteria + results
    ├── decisions.md           ← Stable conclusions
    ├── links.md               ← Hard pointers & references
    ├── run.md                 ← Model, params, run instructions
    ├── assets/                ← Screenshots, data, references
    └── runs/
        └── 001_claude-sonnet_20260303T101500Z/
            ├── transcript.md        ← Full model output
            ├── patch.diff           ← Code diff
            ├── files_changed.txt    ← Files touched
            ├── commands.log         ← Commands executed
            ├── pointers.json        ← Hard pointers (JSON)
            └── notes.md             ← Your observations
```

Every file is plain text. Every folder is predictable. Check the whole thing into git if you want.

See [docs/spec.md](./docs/spec.md) for the full specification.

## CLI reference

| Command | Description |
|---------|-------------|
| `taskpack new <name>` | Create a new task workspace |
| `taskpack run <task> -m <model> [--dry]` | Create a run stub |
| `taskpack close <task> --run <id>` | Validate hard pointers and close |
| `taskpack resume <task>` | Show status and next steps |
| `taskpack search <query>` | Grep across all tasks |

### Flags

- `--model`, `-m` — Model name (default: `"default"`)
- `--dry` — Preview what `run` would create without writing anything
- `--run` — Run number for `close` (e.g., `001`)

## Contributing

Contributions are welcome! This project is intentionally small. If your idea
fits the "tiny, understandable, immediately useful" spirit, open an issue first
and let's talk.

```bash
git clone https://github.com/yourorg/taskpack.git
cd taskpack
npm install
npm run build
npm test
```

Please keep PRs focused. One feature or fix per PR. Tests appreciated.

## Roadmap

- [ ] **Real LLM adapters** — OpenAI, Anthropic, Google, local models
- [ ] **MCP server adapter** — optional, clearly separated
- [ ] **Semantic search plugin** — search by meaning, not just text
- [ ] **VS Code extension** — sidebar for task management (later)
- [ ] **Multi-agent runs** — coordinate multiple models on one task

## License

[MIT](./LICENSE)

---

<p align="center">
  <strong>Your prompts are worth saving.</strong><br>
  <code>npm install -g taskpack</code>
</p>
