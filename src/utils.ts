import memoize = require("lodash.memoize");
import { parsedSvgPorn } from "./data/svg-porn-parsed";

export const getPascalCasedName = (name: string) => {
  // Support "Hello world wy friend" or "hello-world-wy-friend.svg"
  const cleanName = name
    .replace(/.svg/g, "")
    .replace(/icon/g, "")
    .replace(/[^a-zA-Z-]/g, "")
    .replace(/ /g, "-");

  console.log({ cleanName });
  const pascalCasedName = cleanName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return pascalCasedName;
};

export const addNewLineAfterSemi = (str: string) => {
  return str;
};

export const deleteFirstAndLastLine = (str: string) => {
  return str
    .split(
      `
`
    )
    .slice(2, -3).join(`
`);
};

export const getStringAfterLastSlash = (url: string) => {
  return url.split("/").pop();
};

const match = memoize(
  (str: string, name: string) =>
    leven(str.toLowerCase(), name.toLowerCase()) || 0
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

const array: number[] = [];
const characterCodeCache: number[] = [];

/*
 * leven function extracted from https://github.com/sindresorhus/leven
 */

export const leven = (first: string, second: string) => {
  if (first === second) {
    return 0;
  }

  const swap = first;

  if (first.length > second.length) {
    first = second;
    second = swap;
  }

  let firstLength = first.length;
  let secondLength = second.length;

  while (
    firstLength > 0 &&
    first.charCodeAt(~-firstLength) === second.charCodeAt(~-secondLength)
  ) {
    firstLength--;
    secondLength--;
  }

  let start = 0;

  while (
    start < firstLength &&
    first.charCodeAt(start) === second.charCodeAt(start)
  ) {
    start++;
  }

  firstLength -= start;
  secondLength -= start;

  if (firstLength === 0) {
    return secondLength;
  }

  let bCharacterCode;
  let result;
  let temporary;
  let temporary2;
  let index = 0;
  let index2 = 0;

  while (index < firstLength) {
    characterCodeCache[index] = first.charCodeAt(start + index);
    array[index] = ++index;
  }

  while (index2 < secondLength) {
    bCharacterCode = second.charCodeAt(start + index2);
    temporary = index2++;
    result = index2;

    for (index = 0; index < firstLength; index++) {
      temporary2 =
        bCharacterCode === characterCodeCache[index]
          ? temporary
          : temporary + 1;
      temporary = array[index];
      // eslint-disable-next-line no-multi-assign
      result = array[index] =
        temporary > result
          ? temporary2 > result
            ? result + 1
            : temporary2
          : temporary2 > temporary
          ? temporary + 1
          : temporary2;
    }
  }

  return result;
};
