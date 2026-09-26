import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { isCancel, password } from "@clack/prompts";

function configDirectory() {
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "jevgrep");
}

export async function authenticate(fromStdin: boolean) {
  let key: string;
  if (fromStdin) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    key = Buffer.concat(chunks).toString("utf8").trim();
  } else {
    if (!process.stdin.isTTY) throw new Error("Use auth --stdin to read a piped key.");
    const answer = await password({ message: "Paste your Vercel AI Gateway API key" });
    if (isCancel(answer)) {
      process.exitCode = 130;
      return;
    }
    key = answer.trim();
  }
  if (!key || /\s/.test(key)) throw new Error("Provide one non-empty API key.");
  const directory = configDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  const temporary = join(directory, `.credentials-${randomUUID()}.json`);
  try {
    await writeFile(temporary, JSON.stringify({ apiKey: key }) + "\n", { mode: 0o600, flag: "wx" });
    await rename(temporary, join(directory, "credentials.json"));
  } finally {
    await rm(temporary, { force: true });
  }
  console.error("AI Gateway key saved. Run jevgrep doctor to verify access.");
}

export async function loadApiKey(): Promise<string> {
  const fromEnvironment = process.env.AI_GATEWAY_API_KEY?.trim();
  if (fromEnvironment) return fromEnvironment;
  try {
    const credentials = JSON.parse(
      await readFile(join(configDirectory(), "credentials.json"), "utf8"),
    );
    if (typeof credentials.apiKey !== "string" || !credentials.apiKey.trim()) {
      throw new Error("Invalid credentials. Run jevgrep auth again.");
    }
    return credentials.apiKey;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Run jevgrep auth or set AI_GATEWAY_API_KEY.");
    }
    throw error;
  }
}
