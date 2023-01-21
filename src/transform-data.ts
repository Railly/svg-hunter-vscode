import { writeFileSync } from "node:fs";
import { rawSvgPorn } from "./data/svg-porn";

interface ISvgPornJson {
  name: string;
  shortname: string;
  url: string;
  files: string[];
}

const parseSvgPornJson = (json: Array<ISvgPornJson>) => {
  const svgPornJson = json.map((item) => {
    return {
      [item.name]: item.files,
    };
  });

  writeFileSync(
    "./src/data/svg-porn-parsed.ts",
    `/* eslint-disable @typescript-eslint/naming-convention */
//@ts-nocheck
export const parsedSvgPorn = ${JSON.stringify(
      svgPornJson,
      null,
      2
    )} as Array<{ [key: string]: string[] }>;
`
  );
};

parseSvgPornJson(rawSvgPorn);
