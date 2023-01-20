import { request } from "node:https";

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

type TSvgProvider = "svg-porn";

export function getLatestSVGs(provider: TSvgProvider) {
  switch (provider) {
    case "svg-porn":
      return new Promise((resolve, reject) => {
        const options = {
          host: "https://api.github.com/",
          path: "/repos/gilbarbara/logos/contents/logos.json?ref=main",
          method: "GET",
        };

        const req = request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              const svgs = JSON.parse(data);
              resolve(svgs);
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on("error", (err) => {
          console.log("Error: " + err.message);
          reject(err);
        });

        req.end();
      });
  }
}
