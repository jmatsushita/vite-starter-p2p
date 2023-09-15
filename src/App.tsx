import { useEffect, useState } from "react";
import { CtxAsync, useCachedState, useQuery } from "@vlcn.io/react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import vlcnLogo from "./assets/vlcn.png";
import "./App.css";
import randomWords from "./support/randomWords.js";
import { useDB } from "@vlcn.io/react";
import Peers from "./Peers";
import { wdbRtc } from "@vlcn.io/sync-p2p";
import { Ctx } from "./ctx";
import { stringify as uuidStringify } from "uuid";

type TestRecord = { site_id:string,  id: string; name: string };
const wordOptions = { exactly: 3, join: " " };

// Avoid peerjs ID already in use 
let didInit = false;

let cnt = 0;
function App({ dbname }: { dbname: string }) {
  const ctx = useDB(dbname);

  const [siteid, setSiteid] = useState<string>("");
  const [rtc, setRtc] = useState<Ctx["rtc"]>();

  useEffect(() => {
    let rtcVal: Awaited<ReturnType<typeof wdbRtc>>, cleanup: () => void;
      
    async function connect() {
      const rtcVal = await wdbRtc(
        ctx.db,
        // window.location.hostname === "localhost"
        //   ? {
        //       host: "localhost",
        //       port: 9000,
        //       path: "/examples",
        //     }
        // : undefined
      );
      // console.log("rtc", rtcVal)
      setRtc(rtcVal);

      const [[r]] = await ctx.db.execA("SELECT crsql_site_id()");
      // console.log("r", r)
      const sid = uuidStringify(r);
      // const sid = r.toString();
      setSiteid(sid);
      console.log("siteid", sid)
      const [rows] = await ctx.db.execO("SELECT * FROM crsql_changes");
      console.log("rows", rows)

    }
  
    if (!didInit) {
      didInit = true;
      connect();
      
      return () => {
        rtcVal?.dispose();
        cleanup && cleanup();
      };
    };
  }, [ctx.db]);

  const data = useQuery<TestRecord>(
    ctx,
    "SELECT * FROM test ORDER BY id DESC"
  ).data;

  const addData = () => {
    ctx.db.exec("INSERT INTO test (id, name) VALUES (?, ?);", [
      // nanoid(10),
      cnt++,
      randomWords(wordOptions) as string,
    ]);
  };

  const dropData = () => {
    ctx.db.exec("DELETE FROM test;");
  };

  if (!rtc || !siteid) return <div>Loading...</div>;

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://vlcn.io" target="_blank">
          <img src={vlcnLogo} className="logo vlcn" alt="Vulcan logo" />
        </a>
      </div>
      <h1>Vite + React + Vulcan</h1>
      <div className="card">
        <Peers ctx={{db: ctx.db, rx: ctx.rx, siteid, rtc }} />
        <button onClick={addData} style={{ marginRight: "1em" }}>
          Add Data
        </button>
        <button onClick={dropData}>Drop Data</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={`${row.site_id}${row.id}`}>
                <td>{row.id}</td>
                <td>
                  <EditableItem ctx={ctx} id={row.id} value={row.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p>
          Open another browser and navigate to{" "}
          <a href={window.location.href} target="_blank">
            this window's url
          </a>{" "}
          to test sync.
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite, React and Vulcan logos to learn more
      </p>
    </>
  );
}

function EditableItem({
  ctx,
  id,
  value,
}: {
  ctx: CtxAsync;
  id: string;
  value: string;
}) {
  // Generally you will not need to use `useCachedState`. It is only required for highly interactive components
  // that write to the database on every interaction (e.g., keystroke or drag) or in cases where you want
  // to de-bounce your writes to the DB.
  //
  // `useCachedState` will never be required once when one of the following is true:
  // a. We complete the synchronous Reactive SQL layer (SQLiteRX)
  // b. We figure out how to get SQLite-WASM to do a write + read round-trip in a single event loop tick
  const [cachedValue, setCachedValue] = useCachedState(value);
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCachedValue(e.target.value);
    // You could de-bounce your write to the DB here if so desired.
    return ctx.db.exec("UPDATE test SET name = ? WHERE id = ?;", [
      e.target.value,
      id,
    ]);
  };

  return <input type="text" value={cachedValue} onChange={onChange} />;
}

export default App;

const nanoid = (t = 21) =>
  crypto
    .getRandomValues(new Uint8Array(t))
    .reduce(
      (t, e) =>
        (t +=
          (e &= 63) < 36
            ? e.toString(36)
            : e < 62
            ? (e - 26).toString(36).toUpperCase()
            : e > 62
            ? "-"
            : "_"),
      ""
    );
