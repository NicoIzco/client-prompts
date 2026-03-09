#!/usr/bin/env node

import { Command } from "commander";
import { newTask } from "./commands/new.js";
import { runTask } from "./commands/run.js";
import { closeRun } from "./commands/close.js";
import { resumeTask } from "./commands/resume.js";
import { searchTasks } from "./commands/search.js";
import { fail } from "./utils/output.js";

const program = new Command();

program
  .name("taskpack")
  .description(
    "Task workspaces on disk — write prompts in files, never lose context again."
  )
  .version("0.1.0");

program
  .command("new")
  .description("Create a new task workspace")
  .argument("<name>", "Task name (will be slugified)")
  .action(async (name: string) => {
    try {
      await newTask(name);
    } catch (e) {
      fail((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("run")
  .description("Create a run stub for a task")
  .argument("<task>", "Path to task directory")
  .option("-m, --model <model>", "Model name", "default")
  .option("--dry", "Dry run — print what would happen without writing files")
  .action(async (task: string, opts: { model: string; dry: boolean }) => {
    try {
      await runTask(task, opts.model, opts.dry ?? false);
    } catch (e) {
      fail((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("close")
  .description("Close a run after validating hard pointers")
  .argument("<task>", "Path to task directory")
  .requiredOption("--run <id>", "Run number to close (e.g. 001)")
  .action(async (task: string, opts: { run: string }) => {
    try {
      const ok = await closeRun(task, opts.run);
      if (!ok) process.exit(1);
    } catch (e) {
      fail((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("resume")
  .description("Show status of a task and where to continue")
  .argument("<task>", "Path to task directory")
  .action(async (task: string) => {
    try {
      await resumeTask(task);
    } catch (e) {
      fail((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("search")
  .description("Search across all tasks for a query string")
  .argument("<query>", "Search query")
  .action(async (query: string) => {
    try {
      await searchTasks(query);
    } catch (e) {
      fail((e as Error).message);
      process.exit(1);
    }
  });

program.parse();
