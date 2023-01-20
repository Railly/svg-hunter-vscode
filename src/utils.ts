import memoize from "lodash.memoize";
import leven from "leven";
import svgPornJsonParsed from "./data/svg-porn-parsed.json" assert { type: "json" };

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const match = memoize((str: string, name: string) =>
  leven(str.toLowerCase(), name.toLowerCase())
);

export function suggestName({
  name,
  files,
}: {
  name: string;
  files: Array<{ [key: string]: string[] }>;
}) {
  const isFile = files.hasOwnProperty(name);

  if (isFile) {
    return name;
  }

  const nameRegExp = new RegExp(name, "i");

  return files
    .filter((k) => nameRegExp.test(Object.keys(k)[0]))
    .sort(
      (a, b) => match(Object.keys(a)[0], name) - match(Object.keys(b)[0], name)
    );
}

suggestName({
  name: "ver",
  files: svgPornJsonParsed as any,
});
