import { aptosClient } from '../utils/aptosClient';
interface QueryResult {
  events: Array<{
    version: string;
    type: string;
    data: {
      buyer?: string;
      amount?: number;
      winner?: string;
      reward?: number;
      borrower?: string;
      fees?: number;
    };
  }>;
}

// Fetching events related to your module
async function fetchRaflashEvents(accountAddress: string) {
  const res = await aptosClient().queryIndexer<QueryResult>({
    query: {
      variables: {
        accountAddress: accountAddress,
      },
      query: `
        query RaflashEvents($accountAddress: String) {
          events(
            where: {
              account_address: {
                _eq: $accountAddress
              },
              event_type: {
                _in: [
                  "module_addr::raflash::TicketBoughtEvent",
                  "module_addr::raflash::TicketRepaidEvent",
                  "module_addr::raflash::DrawEvent",
                  "module_addr::raflash::FlashloanEvent"
                ]
              }
            }
          ) {
            version
            type
            data
          }
        }
      `,
    },
  });

  return res.events;
}

// Example usage of the function
async function getEvents(accountAddress: string) {
  const events = await fetchRaflashEvents(accountAddress);

  events.forEach((event) => {
    console.log(`Event Version: ${event.version}`);
    console.log(`Event Type: ${event.type}`);
    console.log(`Event Data: ${JSON.stringify(event.data)}`);
  });
}

// Replace with the actual account address
getEvents("your_account_address_here");
