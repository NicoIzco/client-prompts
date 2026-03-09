import path from "node:path";
import fs from "fs-extra";
import { taskDir, findRunDir, resolveTaskPath } from "../utils/paths.js";
import {
  success,
  info,
  fail,
  heading,
  bullet,
  divider,
} from "../utils/output.js";

interface ValidationResult {
  file: string;
  ok: boolean;
  reason: string;
}

function isMarkedNA(content: string): boolean {
  return /\bN\/A\b/i.test(content);
}

async function checkArtifact(
  filePath: string,
  label: string
): Promise<ValidationResult> {
  if (!(await fs.pathExists(filePath))) {
    return { file: label, ok: false, reason: "file missing" };
  }
  const content = (await fs.readFile(filePath, "utf-8")).trim();
  if (content.length === 0) {
    return { file: label, ok: false, reason: "empty — fill it or mark N/A" };
  }
  if (isMarkedNA(content)) {
    return { file: label, ok: true, reason: "marked N/A" };
  }
  return { file: label, ok: true, reason: "ok" };
}

async function checkPointers(filePath: string): Promise<ValidationResult> {
  const label = "pointers.json";
  if (!(await fs.pathExists(filePath))) {
    return { file: label, ok: false, reason: "file missing" };
  }
  const content = (await fs.readFile(filePath, "utf-8")).trim();
  if (isMarkedNA(content)) {
    return { file: label, ok: true, reason: "marked N/A" };
  }
  try {
    const data = JSON.parse(content);
    if (!Array.isArray(data) || data.length === 0) {
      return {
        file: label,
        ok: false,
        reason: "empty array — add at least one pointer or mark N/A",
      };
    }
    return { file: label, ok: true, reason: `${data.length} pointer(s)` };
  } catch {
    return { file: label, ok: false, reason: "invalid JSON" };
  }
}

async function checkPatchOrLink(
  runPath: string,
  taskPath: string
): Promise<ValidationResult> {
  const label = "patch.diff";
  const patchFile = path.join(runPath, "patch.diff");
  const patchContent = (await fs.pathExists(patchFile))
    ? (await fs.readFile(patchFile, "utf-8")).trim()
    : "";

  if (patchContent.length > 0) {
    if (isMarkedNA(patchContent)) {
      return { file: label, ok: true, reason: "marked N/A" };
    }
    return { file: label, ok: true, reason: "ok" };
  }

  const linksFile = path.join(taskDir(taskPath), "links.md");
  if (await fs.pathExists(linksFile)) {
    const links = await fs.readFile(linksFile, "utf-8");
    if (/commit|pull request|PR|github\.com/i.test(links)) {
      return { file: label, ok: true, reason: "link found in links.md" };
    }
  }

  return {
    file: label,
    ok: false,
    reason: "empty — add a diff or link a commit/PR in links.md",
  };
}

export async function closeRun(
  rawTaskPath: string,
  runId: string
): Promise<boolean> {
  const taskPath = resolveTaskPath(rawTaskPath);
  const resolved = taskDir(taskPath);

  if (!(await fs.pathExists(resolved))) {
    throw new Error(`Task not found: ${taskPath}`);
  }

  const runPath = findRunDir(taskPath, runId);
  if (!runPath) {
    throw new Error(
      `Run ${runId} not found in ${taskPath}/runs/. Use \`taskpack resume ${taskPath}\` to see available runs.`
    );
  }

  heading(`Validating run ${runId}`);
  info(path.relative(process.cwd(), runPath));
  divider();

  const results: ValidationResult[] = await Promise.all([
    checkPatchOrLink(runPath, taskPath),
    checkArtifact(path.join(runPath, "files_changed.txt"), "files_changed.txt"),
    checkArtifact(path.join(runPath, "commands.log"), "commands.log"),
    checkPointers(path.join(runPath, "pointers.json")),
  ]);

  let allOk = true;
  for (const r of results) {
    if (r.ok) {
      bullet(`${r.file}: ${r.reason}`);
    } else {
      fail(`${r.file}: ${r.reason}`);
      allOk = false;
    }
  }

  console.log();

  if (!allOk) {
    fail(
      "Hard pointer validation failed. Fill the missing artifacts or mark them N/A, then re-run close."
    );
    return false;
  }

  const now = new Date().toISOString();
  const runDirName = path.basename(runPath);

  const outcomesFile = path.join(resolved, "outcomes.md");
  const outcomeBlock =
    `\n## Run ${runId} — Closed ${now}\n\n` +
    `- **Run dir**: \`runs/${runDirName}/\`\n` +
    `- **Status**: Closed with all pointers validated.\n` +
    `- **Summary**: <!-- Add a one-line summary of what this run achieved. -->\n`;
  await fs.appendFile(outcomesFile, outcomeBlock);

  const decisionsFile = path.join(resolved, "decisions.md");
  const decisionBlock =
    `\n## Decisions from Run ${runId}\n\n` +
    `<!-- Record any stable decisions made during this run. -->\n` +
    `<!-- Example:\n` +
    `- D1: Chose approach X because Y.\n` +
    `- D2: Rejected Z — see transcript for rationale.\n` +
    `-->\n`;
  await fs.appendFile(decisionsFile, decisionBlock);

  success(`Run ${runId} closed successfully.`);
  info(`Updated: outcomes.md, decisions.md`);

  return true;
}
