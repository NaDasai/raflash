import { aptosClient } from "@/utils/aptosClient";
import { useQuery } from "@tanstack/react-query";

interface QueryResult {
    raflash_events: RaflashEvent[];
}

export interface RaflashEvent {
    type: string;
    data: TicketBoughtEvent | TicketRepaidEvent | DrawEvent | FlashloanEvent;
    sequence_number: string;
    transaction_version: string;
    event_index: string;
}

interface TicketBoughtEvent {
    buyer: string;
    amount: string;
}

interface TicketRepaidEvent {
    buyer: string;
    amount: string;
}

interface DrawEvent {
    winner: string;
    rewards: string;
}

interface FlashloanEvent {
    borrower: string;
    amount: string;
    fees: string;
}

export function useGetRaflashEvents(limit: number = 100) {
  return useQuery({
    queryKey: ["raflash-events", limit],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    queryFn: async () => {
      try {
        const res = await aptosClient().queryIndexer<QueryResult>({
          query: {
            variables: {
              limit: limit,
            },
            query: `
              query RaflashEvents($limit: Int!) {
                raflash_events(
                  limit: $limit
                  where: {account_address: {_eq: $contractAddress}}
                  order_by: { transaction_version: desc }
                ) {
                  type
                  data
                  sequence_number
                  transaction_version
                  event_index
                }
              }`,
          },
        });

        const events = res.raflash_events;
        if (!events) return null;

        return [...events] satisfies RaflashEvent[];
      } catch (error) {
        console.error(error);
      }
    },
  });
}