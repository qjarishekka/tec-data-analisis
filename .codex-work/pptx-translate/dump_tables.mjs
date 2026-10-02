import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const presentation = await PresentationFile.importPptx(await FileBlob.load(process.argv[2]));
const snapshot = await presentation.inspect({ kind: "table", maxChars: 200000 });
const tableIds = snapshot.ndjson.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)).filter((o) => o.kind === "table").map((o) => o.id);
for (const id of tableIds) {
  const table = presentation.resolve(id);
  const rows = [];
  for (let r = 0; r < (table.rows.length ?? table.rows.items?.length ?? 0); r += 1) {
    const row = [];
    for (let c = 0; c < (table.columns?.length ?? table.columns?.items?.length ?? table.cols ?? 0); c += 1) {
      const cell = table.getCell(r, c);
      row.push(cell.text?.text ?? cell.text?.toString?.() ?? String(cell.text ?? ""));
    }
    rows.push(row);
  }
  console.log(JSON.stringify({ id, slide: table.data?.slide, rows }));
}
