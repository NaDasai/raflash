import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "0x037460d919f725db056a21b9da4682088748f6128b1ae2ce8ddf9a10ab469c0a";
const MODULE_NAME = "raflash";

export type RepayTicketArguments = {
};

export const repayTicket = (args: RepayTicketArguments): InputTransactionData => {
  const { } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::repay_ticket`,
      functionArguments: [],
    },
  };
};