import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "module_addr";
const MODULE_NAME = "raflash";

export type DrawWinnerArguments = {
};

export const buyTicket = (args: DrawWinnerArguments): InputTransactionData => {
  const { } = args;
  return {
    data: {
      function: `MODULE_ADDRESS::raflash::draw`,
      functionArguments: [],
    },
  };
};