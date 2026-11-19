/**
 * Owner-controlled administrator provisioning and recovery (PRD §9.1, §9.3).
 *
 *   npm run admin:create   – create the single admin user (first deployment)
 *   npm run admin:reset    – set a new password (password recovery)
 *
 * The password is typed into this terminal only. It is never written to disk,
 * logged, or passed through the app. Requires SUPABASE_SECRET_KEY, which only
 * the owner holds, so this is not an unauthenticated route to data.
 *
 * Production: run with the production env file, e.g.
 *   node --env-file=.env.production.local --import tsx scripts/admin-account.mts create
 */
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

const mode = process.argv[2];
if (mode !== "create" && mode !== "reset") {
  console.error("Usage: admin-account.mts <create|reset>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_AUTH_EMAIL;
if (!url || !secret || !email) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY or ADMIN_AUTH_EMAIL in the env file.");
  process.exit(1);
}

/** Same rules as the app and Supabase config: 6+ chars, upper, lower, digit. */
function passwordProblem(pw: string): string | null {
  if (pw.length < 6) return "Use at least 6 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) {
    return "Include upper-case and lower-case letters and a number.";
  }
  return null;
}

function askHidden(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput.bind(rl);
    let prompted = false;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (!prompted) {
        write(s);
        prompted = true;
      } else if (s.includes("\n") || s.includes("\r")) {
        write("\n");
      }
    };
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: list, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error(`Could not reach Supabase: ${listError.message}`);
  process.exit(1);
}
const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (mode === "create" && list.users.length > 0) {
  console.error(
    existing
      ? "The administrator already exists. Use `npm run admin:reset` to change the password."
      : "This project already has a different auth user. Pocket Watch supports exactly one administrator.",
  );
  process.exit(1);
}
if (mode === "reset" && !existing) {
  console.error("No administrator found. Run `npm run admin:create` first.");
  process.exit(1);
}

console.log(`Project: ${new URL(url).host}`);
console.log(mode === "create" ? "Create the Pocket Watch administrator password." : "Set a new administrator password.");
console.log("Requirements: 6+ characters with upper-case, lower-case and a number.\n");

let password = "";
for (;;) {
  password = await askHidden("Password: ");
  const problem = passwordProblem(password);
  if (problem) {
    console.log(problem);
    continue;
  }
  const confirm = await askHidden("Confirm password: ");
  if (confirm !== password) {
    console.log("Passwords didn't match. Try again.");
    continue;
  }
  break;
}

if (mode === "create") {
  const { error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error(`Could not create the administrator: ${error.message}`);
    process.exit(1);
  }
  console.log("\nAdministrator created. Default categories and preferences were set up.");
} else {
  const { error } = await supabase.auth.admin.updateUserById(existing!.id, { password });
  if (error) {
    console.error(`Could not update the password: ${error.message}`);
    process.exit(1);
  }
  console.log("\nPassword updated.");
}
