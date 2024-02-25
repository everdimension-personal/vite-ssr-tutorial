import path from "path";
import fs from "fs";
import express from "express";
import he from "he";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

console.log("server js file");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log({ __dirname });
// console.log("dirname is ", __dirname);

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      console.log({ url });
      const template = fs.readFileSync(
        path.resolve(__dirname, "index.html"),
        "utf-8",
      );
      const viteTemplate = await vite.transformIndexHtml(url, template);
      const { render } = await vite.ssrLoadModule("/src/entry.server.jsx");

      const htmlContent = await render(url);
      const html = viteTemplate
        .replace("<!-- ssr-outlet -->", htmlContent)
        .replace("/* script-outlet */", `window.APP_DATA = { URL: '${url}' };`)
        .replace("<!-- vite-template -->", he.encode(viteTemplate));
      // const html = viteTemplate;

      res
        .status(200)
        .set({
          "Content-Type": "text/html",
        })
        .send(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const PORT = 5173;
  app.listen(5173);

  console.log("listening on", `http://localhost:${PORT}`);
}

createServer();
