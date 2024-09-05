import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "0x037460d919f725db056a21b9da4682088748f6128b1ae2ce8ddf9a10ab469c0a";
const MODULE_NAME = "raflash";

export function executeTryFlash({ amount }) {
  return {
    type: "entry_function_payload",
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::try_flash`,
    type_arguments: [],
    arguments: [amount],
  };
}
