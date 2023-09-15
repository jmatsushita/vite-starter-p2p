import App from "./App.tsx";
import schemaContent from "./schemas/main.sql?raw";
import { DBProvider } from "@vlcn.io/react";

const dbname = "sdf";
export default function Root() {
  return (
    <DBProvider
      dbname={dbname}
      schema={{
        name: "main.sql",
        content: schemaContent,
      }}
      Render={() => <App dbname={dbname} />}
    ></DBProvider>
  );
}
