import path from "path";
import fs from "fs";
import express from "express";
import he from "he";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log({ __dirname });

/**
 * @param {import('vite').ViteDevServer | undefined} vite
 */
async function importServerEntry(vite) {
  if (vite) {
    return vite.ssrLoadModule("/src/entry.server.jsx");
  } else {
    return import("./dist/server/entry.server.js");
  }
}

/**
 * @param {string} url
 * @param {import('vite').ViteDevServer | undefined} vite
 */
async function importIndexHtml(url, vite) {
  if (vite) {
    const template = fs.readFileSync(
      path.resolve(__dirname, "index.html"),
      "utf-8",
    );
    return await vite.transformIndexHtml(url, template);
  } else {
    return fs.readFileSync(
      path.resolve(__dirname, "./dist/client/index.html"),
      "utf-8",
    );
  }
}

async function createServer() {
  const app = express();

  let vite;
  if (process.env.NODE_ENV === "production") {
    vite = null;
    const sirv = (await import("sirv")).default;
    app.use(sirv("./dist/client"));
  } else {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);
  }

  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      console.log({ url });

      const template = await importIndexHtml(url, vite);
      const { render } = await importServerEntry(vite);

      const htmlContent = await render(url);
      const html = template
        .replace("<!-- ssr-outlet -->", htmlContent)
        .replace("/* script-outlet */", `window.APP_DATA = { URL: '${url}' };`)
        .replace("<!-- vite-template -->", he.encode(template));

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
