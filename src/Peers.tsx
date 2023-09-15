import { useState, useEffect } from "react";
import { Ctx } from "./ctx.js";

export default function Peers({ ctx }: { ctx: Ctx }) {
  const [peerId, setPeerId] = useState<string>("");
  const [pending, setPending] = useState<string[]>([]);
  const [established, setEstablished] = useState<string[]>([]);

  useEffect(() => {
    const cleanup = ctx.rtc.onConnectionsChanged((pending, established) => {
      console.log("conns changes");
      setPending(pending);
      setEstablished(established);
    });
    return () => {
      cleanup();
    };
  }, [ctx.rtc]);

  return (
    <div className="peers">
      <div
        className="siteid"
        onClick={() => {
          navigator.clipboard.writeText(ctx.siteid);
        }}
      >
        PeerID: {ctx.siteid}
      </div>
      <div className="connect">
        <input
          type="text"
          onChange={(e) => setPeerId(e.target.value)}
          value={peerId}
        ></input>
        <a
          href="#"
          onClick={() => {
            ctx.rtc.connectTo(peerId);
          }}
        >
          Connect
        </a>
      </div>
      <div className="connections">
        <ul className="pending">
          {pending.map((p) => (
            <li id={p} key={p}>{p.substring(0, 8)}</li>
          ))}
        </ul>
        <ul className="established">
          {established.map((p) => (
            <li id={p} key={p}>{p.substring(0, 8)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
