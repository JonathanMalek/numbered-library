// The library as plain files (nb-8l9.60.2, D13: "a nightly job exports D1
// into a public repository of plain files").
//
//   node export.mjs <base-url> <directory>
//
// It reads what anyone can read, the index and each file it names, checks
// each file's SHA-256 against the index, and writes
//
//   <directory>/index.json
//   <directory>/items/<id>/<version>.md     a style
//   <directory>/items/<id>/<version>.json   a template
//
// so the library outlives Cloudflare, an account lapse, or us. It needs no
// secret: the public repository's own nightly workflow runs it against
// https://numbered.app and commits what changed, and its history keeps
// every version. `items/` is written afresh each night, so a file taken down
// leaves the tree as it left the index.

import { mkdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

export async function exportLibrary(base, directory) {
  const got = await fetch(new URL("/library/index.json", base));
  if (!got.ok) throw new Error(`index.json: ${got.status}`);
  const text = await got.text();
  const index = JSON.parse(text);
  await rm(join(directory, "items"), { recursive: true, force: true });
  for (const item of index.items) {
    const file = await fetch(new URL(`/library/items/${item.id}/${item.version}`, base));
    if (!file.ok) throw new Error(`${item.id}/${item.version}: ${file.status}`);
    const bytes = Buffer.from(await file.arrayBuffer());
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== item.sha256) throw new Error(`${item.id}/${item.version}: its SHA-256 is not the index's`);
    const folder = join(directory, "items", item.id);
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, `${item.version}.${item.kind === "style" ? "md" : "json"}`), bytes);
  }
  await writeFile(join(directory, "index.json"), text);
  return index.items.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [base, directory] = process.argv.slice(2);
  if (!base || !directory) {
    console.error("usage: node export.mjs <base-url> <directory>");
    process.exit(2);
  }
  const count = await exportLibrary(base, directory);
  console.log(`exported ${count} files to ${directory}`);
}
