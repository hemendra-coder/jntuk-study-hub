import fs from "fs";
import path from "path";

const clientDir = path.resolve("dist/client");
const assetsDir = path.join(clientDir, "assets");

if (!fs.existsSync(clientDir) || !fs.existsSync(assetsDir)) {
  throw new Error("dist/client or dist/client/assets does not exist. Run npm run build first.");
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => /^index-.*\.js$/.test(f));
const cssFile = files.find((f) => /^styles-.*\.css$/.test(f));

if (!jsFile) {
  throw new Error("Could not find client entry JS file in dist/client/assets.");
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/lovable-uploads/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JNTUK Study Hub</title>
    ${cssFile ? `<link rel="stylesheet" href="./assets/${cssFile}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./assets/${jsFile}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, "index.html"), html);
console.log("Generated dist/client/index.html");
