import path from "node:path";
import fs from "fs-extra";
import {
  taskDir,
  nextRunNumber,
  timestamp,
  resolveTaskPath,
} from "../utils/paths.js";
import {
  success,
  info,
  warn,
  heading,
  bullet,
  dim,
  divider,
} from "../utils/output.js";

export async function runTask(
  rawTaskPath: string,
  model: string,
  dry: boolean
): Promise<string | null> {
  const taskPath = resolveTaskPath(rawTaskPath);
  const resolved = taskDir(taskPath);

  if (!(await fs.pathExists(resolved))) {
    throw new Error(`Task not found: ${taskPath}`);
  }

  const promptFile = path.join(resolved, "prompt.md");
  const contextFile = path.join(resolved, "context.md");

  if (!(await fs.pathExists(promptFile))) {
    throw new Error(`Missing prompt.md in ${taskPath}`);
  }

  const prompt = await fs.readFile(promptFile, "utf-8");
  const context = (await fs.pathExists(contextFile))
    ? await fs.readFile(contextFile, "utf-8")
    : "";

  const assetsDir = path.join(resolved, "assets");
  const assets = (await fs.pathExists(assetsDir))
    ? await fs.readdir(assetsDir)
    : [];

  const runNum = nextRunNumber(taskPath);
  const ts = timestamp();
  const runDirName = `${runNum}_${model}_${ts}`;

  if (dry) {
    heading("Dry run");
    info(`Task:   ${taskPath}`);
    info(`Model:  ${model}`);
    info(`Run:    ${runDirName}`);
    divider();
    info("Prompt preview (first 5 lines):");
    prompt
      .split("\n")
      .slice(0, 5)
      .forEach((l) => dim(`  ${l}`));
    if (context) {
      info(`Context: ${contextFile} (${context.length} chars)`);
    }
    if (assets.length > 0) {
      info(`Assets: ${assets.join(", ")}`);
    }
    console.log();
    warn("No files written (dry run).");
    return null;
  }

  const runDir = path.join(resolved, "runs", runDirName);
  await fs.ensureDir(runDir);

  await fs.writeFile(
    path.join(runDir, "transcript.md"),
    `# Transcript — Run ${runNum}\n\n` +
      `**Model**: ${model}\n` +
      `**Started**: ${new Date().toISOString()}\n\n` +
      `## Instructions\n\n` +
      `Paste the model's response below. Include the full output so this\n` +
      `transcript serves as a permanent record.\n\n` +
      `---\n\n` +
      `<!-- Paste model output here -->\n`
  );

  await fs.writeFile(path.join(runDir, "patch.diff"), "");
  await fs.writeFile(path.join(runDir, "files_changed.txt"), "");
  await fs.writeFile(path.join(runDir, "commands.log"), "");
  await fs.writeFile(path.join(runDir, "pointers.json"), "[]\n");
  await fs.writeFile(
    path.join(runDir, "notes.md"),
    `# Notes — Run ${runNum}\n\n` +
      `Observations, surprises, or follow-ups from this run.\n`
  );

  const linksFile = path.join(resolved, "links.md");
  const runRelPath = path.relative(resolved, runDir);
  const linkBlock =
    `\n## Run ${runNum}\n\n` +
    `- **Path**: \`${runRelPath}/\`\n` +
    `- **Model**: ${model}\n` +
    `- **Time**: ${new Date().toISOString()}\n\n` +
    `### Required pointers (fill before closing)\n\n` +
    `- [ ] \`patch.diff\` — commit diff or link to PR\n` +
    `- [ ] \`files_changed.txt\` — list of files touched\n` +
    `- [ ] \`commands.log\` — commands executed\n` +
    `- [ ] \`pointers.json\` — at least one hard pointer\n`;

  await fs.appendFile(linksFile, linkBlock);

  const relRunDir = path.relative(process.cwd(), runDir);

  heading(`Run ${runNum} created`);
  info(`${relRunDir}/`);
  console.log();
  bullet("transcript.md    — paste the model's response here");
  bullet("patch.diff       — add the commit diff");
  bullet("files_changed.txt — list changed files");
  bullet("commands.log     — log commands you ran");
  bullet("pointers.json    — add hard pointers");
  bullet("notes.md         — your observations");
  console.log();
  success(
    `Next: run your prompt with ${model}, paste output into transcript.md`
  );
  info(`Then: \`taskpack close ${taskPath} --run ${runNum}\``);

  return relRunDir;
}
