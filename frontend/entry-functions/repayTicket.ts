import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "module_addr";
const MODULE_NAME = "raflash";

export type RepayTicketArguments = {
};

export const repayTicket = (args: RepayTicketArguments): InputTransactionData => {
  const { } = args;
  return {
    data: {
      function: `MODULE_ADDRESS::raflash::repay_ticket`,
      functionArguments: [],
    },
  };
};