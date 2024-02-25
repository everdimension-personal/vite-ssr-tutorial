import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

export function render(url) {
  return ReactDOM.hydrateRoot(
    document.getElementById("root"),
    <React.StrictMode>
      <App url={url} />
    </React.StrictMode>,
  );
}

render(window.APP_DATA.URL);
