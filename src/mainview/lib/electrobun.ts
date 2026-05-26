import { Electroview } from "electrobun/view";
import type { MainRPC } from "../../shared/rpc/types";

const rpc = Electroview.defineRPC<MainRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {},
    messages: {},
  },
});

export const electrobun = new Electroview({ rpc });
