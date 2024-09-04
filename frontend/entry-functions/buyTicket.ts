import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "module_addr";
const MODULE_NAME = "raflash";

export type BuyTicketsArguments = {
};

export const buyTicket = (args: BuyTicketArguments): InputTransactionData => {
  const { } = args;
  return {
    data: {
      function: `MODULE_ADDRESS::raflash::buy_ticket`,
      functionArguments: [],
    },
  };
};