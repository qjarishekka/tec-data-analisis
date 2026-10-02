import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const p = await PresentationFile.importPptx(await FileBlob.load(process.argv[2]));
const t = p.resolve("sh/k3yl0zql");
console.log(JSON.stringify({targetKeys:Object.keys(t), textType:typeof t.text, textKeys:Object.keys(t.text ?? {}), textString:String(t.text), text:t.text}, null, 2));
