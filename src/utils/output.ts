const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BLUE = "\x1b[34m";

export function success(msg: string): void {
  console.log(`${GREEN}${BOLD}✔${RESET} ${msg}`);
}

export function info(msg: string): void {
  console.log(`${CYAN}ℹ${RESET} ${msg}`);
}

export function warn(msg: string): void {
  console.log(`${YELLOW}⚠${RESET} ${msg}`);
}

export function fail(msg: string): void {
  console.error(`${RED}${BOLD}✖${RESET} ${msg}`);
}

export function heading(msg: string): void {
  console.log(`\n${BOLD}${BLUE}${msg}${RESET}`);
}

export function dim(msg: string): void {
  console.log(`${DIM}${msg}${RESET}`);
}

export function bullet(msg: string): void {
  console.log(`  ${DIM}•${RESET} ${msg}`);
}

export function divider(): void {
  console.log(`${DIM}${"─".repeat(50)}${RESET}`);
}
