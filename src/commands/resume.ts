import path from "node:path";
import fs from "fs-extra";
import { taskDir, resolveTaskPath } from "../utils/paths.js";
import {
  info,
  warn,
  heading,
  bullet,
  dim,
  divider,
} from "../utils/output.js";

export async function resumeTask(rawTaskPath: string): Promise<void> {
  const taskPath = resolveTaskPath(rawTaskPath);
  const resolved = taskDir(taskPath);

  if (!(await fs.pathExists(resolved))) {
    throw new Error(`Task not found: ${taskPath}`);
  }

  heading(`Resume: ${taskPath}`);
  divider();

  const runsPath = path.join(resolved, "runs");
  if (!(await fs.pathExists(runsPath))) {
    warn("No runs yet. Create one with `taskpack run`.");
    return;
  }

  const entries = (await fs.readdir(runsPath))
    .filter((e) => /^\d{3}_/.test(e))
    .sort();

  if (entries.length === 0) {
    warn("No runs yet. Create one with `taskpack run`.");
    return;
  }

  info(`Total runs: ${entries.length}`);
  console.log();

  const last = entries[entries.length - 1];
  const lastRunPath = path.join(runsPath, last);

  heading(`Last run: ${last}`);

  const artifacts = [
    "transcript.md",
    "patch.diff",
    "files_changed.txt",
    "commands.log",
    "pointers.json",
    "notes.md",
  ];

  const missing: string[] = [];
  const empty: string[] = [];

  for (const file of artifacts) {
    const fp = path.join(lastRunPath, file);
    if (!(await fs.pathExists(fp))) {
      missing.push(file);
    } else {
      const content = (await fs.readFile(fp, "utf-8")).trim();
      if (content.length === 0) {
        empty.push(file);
      } else if (file === "pointers.json") {
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data) && data.length === 0) {
            empty.push(file);
          }
        } catch {
          /* invalid JSON treated as non-empty for display */
        }
      }
    }
  }

  if (missing.length > 0) {
    warn("Missing artifacts:");
    missing.forEach((f) => bullet(f));
  }

  if (empty.length > 0) {
    warn("Empty artifacts (need content or N/A):");
    empty.forEach((f) => bullet(f));
  }

  if (missing.length === 0 && empty.length === 0) {
    info("All artifacts have content. Ready to close:");
    const runNum = last.slice(0, 3);
    dim(`  taskpack close ${taskPath} --run ${runNum}`);
  } else {
    console.log();
    info("Next steps:");
    bullet(`Fill the empty artifacts in runs/${last}/`);
    const runNum = last.slice(0, 3);
    bullet(`Then: taskpack close ${taskPath} --run ${runNum}`);
  }

  console.log();

  if (entries.length > 1) {
    dim("Previous runs:");
    entries.slice(0, -1).forEach((e) => dim(`  runs/${e}/`));
  }
}
