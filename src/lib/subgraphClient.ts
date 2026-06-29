// lib/subgraphClient.ts
import { Client, fetchExchange } from "@urql/core";

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL!;

if (!SUBGRAPH_URL) {
  console.error("❌ NEXT_PUBLIC_SUBGRAPH_URL is not defined!");
}

export const subgraphClient = new Client({
  url: SUBGRAPH_URL,
  exchanges: [fetchExchange],
  // Force POST method (more reliable)
  fetchOptions: {
    method: "POST",
  },
});
