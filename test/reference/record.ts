import { replay } from "./replay";
const result = await replay();
if (result.code !== 0 || result.stderr) throw new Error("Reference failed");
console.log(JSON.stringify({ requests: result.requests, stdout: result.stdout }, null, 2));
