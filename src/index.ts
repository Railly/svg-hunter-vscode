import { getLatestSVGs } from "./utils";

(async () => {
  const latestSVGs = await getLatestSVGs("svg-porn");
  console.log({ latestSVGs });
})();