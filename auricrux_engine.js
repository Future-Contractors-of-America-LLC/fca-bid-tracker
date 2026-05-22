import { runAuricrux } from "./auricrux/auricrux-exec.mjs";

try {
  await runAuricrux();
} catch (e) {
  console.error("AURICRUX_EXEC_FAILURE");
  console.error(e);
  process.exit(1);
}