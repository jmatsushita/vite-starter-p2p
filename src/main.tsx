import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import schemaContent from "./schemas/main.sql?raw";
import { DBProvider } from "@vlcn.io/react";

// Launch our app.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

function Root() {

  return (
    <DBProvider
      dbname="p2p"
      schema={{
        name: "main.sql",
        content: schemaContent,
      }}
      Render={() => <App dbname="p2p"/>}
    ></DBProvider>
  );
}
