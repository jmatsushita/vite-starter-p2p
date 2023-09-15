import { wdbRtc } from "@vlcn.io/sync-p2p";
import tblrx from "@vlcn.io/rx-tbl";
import { DBAsync } from "@vlcn.io/xplat-api";

export type Ctx = {
  db: DBAsync;
  siteid: string;
  rtc: Awaited<ReturnType<typeof wdbRtc>>;
  rx: Awaited<ReturnType<typeof tblrx>>;
};
