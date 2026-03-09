import path from "node:path";
import fs from "fs-extra";
import {
  tasksRoot,
  templatesDir,
  slugify,
  datestamp,
} from "../utils/paths.js";
import { success, info, bullet, heading } from "../utils/output.js";

const TEMPLATE_FILES = [
  "prompt.md",
  "context.md",
  "outcomes.md",
  "decisions.md",
  "links.md",
  "run.md",
];

export async function newTask(name: string): Promise<string> {
  const slug = slugify(name);
  const dirname = `${datestamp()}_${slug}`;
  const taskPath = path.join(tasksRoot(), dirname);

  if (await fs.pathExists(taskPath)) {
    throw new Error(`Task already exists: ${taskPath}`);
  }

  await fs.ensureDir(taskPath);
  await fs.ensureDir(path.join(taskPath, "assets"));
  await fs.ensureDir(path.join(taskPath, "runs"));

  const tplDir = templatesDir();

  for (const file of TEMPLATE_FILES) {
    const src = path.join(tplDir, file);
    const dest = path.join(taskPath, file);
    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
    } else {
      await fs.writeFile(dest, `# ${path.basename(file, ".md")}\n`);
    }
  }

  const relPath = path.relative(process.cwd(), taskPath);

  heading("Task created");
  info(`${relPath}`);
  console.log();
  bullet("prompt.md    — write your canonical prompt here");
  bullet("context.md   — environment & constraints");
  bullet("outcomes.md  — acceptance criteria");
  bullet("decisions.md — stable conclusions");
  bullet("links.md     — hard pointers & references");
  bullet("run.md       — model & run config");
  bullet("assets/      — screenshots, files, data");
  bullet("runs/        — created by `taskpack run`");
  console.log();
  success(`Next: edit ${relPath}/prompt.md, then \`taskpack run ${relPath}\``);

  return relPath;
}
