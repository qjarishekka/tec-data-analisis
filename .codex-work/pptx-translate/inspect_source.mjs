import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const sourcePath = process.argv[2];
const outputDir = process.argv[3];
if (!sourcePath || !outputDir) throw new Error("Usage: node inspect_source.mjs source.pptx outputDir");

await fs.mkdir(outputDir, { recursive: true });
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,table,chart,notes,layout",
  maxChars: 200000,
});
await fs.writeFile(path.join(outputDir, "source-inspect.ndjson"), snapshot.ndjson, "utf8");

const montage = await presentation.export({ format: "png", montage: true, scale: 1 });
await fs.writeFile(path.join(outputDir, "source-montage.png"), new Uint8Array(await montage.arrayBuffer()));

const slideCount = presentation.slides.items.length;
for (let i = 0; i < slideCount; i += 1) {
  const slide = presentation.slides.getItem(i);
  const png = await slide.export({ format: "png", scale: 2 });
  await fs.writeFile(path.join(outputDir, `source-slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(outputDir, `source-slide-${String(i + 1).padStart(2, "0")}.layout.json`), await layout.text(), "utf8");
}

const info = {
  slideCount,
  slideSize: presentation.slideSize,
  masters: presentation.masters.items?.map((master) => ({ id: master.id, name: master.name })) ?? [],
};
await fs.writeFile(path.join(outputDir, "source-info.json"), JSON.stringify(info, null, 2), "utf8");
console.log(JSON.stringify(info));
