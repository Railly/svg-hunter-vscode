import fs from "node:fs";
import svgPornJson from "./data/svg-porn.json" assert { type: "json" };

interface ISvgPornJson {
  name: string;
  shortName: string;
  url: string;
  files: string[];
}

const parseSvgPornJson = (json: Array<ISvgPornJson>) => {
  const svgPornJson = json.map((item) => {
    return {
      [item.name]: item.files,
    };
  });

  fs.writeFileSync(
    "./src/data/svg-porn-parsed.json",
    JSON.stringify(svgPornJson, null, 2)
  );
};

parseSvgPornJson(svgPornJson as any);
