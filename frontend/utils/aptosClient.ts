import { API_KEY, NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

// const aptos = new Aptos(new AptosConfig({ network: NETWORK }));

const aptos = new Aptos(
  new AptosConfig({
    network: NETWORK,
    fullnode: `https://aptos-${NETWORK}.nodit.io/${API_KEY}/v1`,
    indexer: `https://aptos-${NETWORK}.nodit.io/${API_KEY}/v1/graphql`,
  }),
);

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}
