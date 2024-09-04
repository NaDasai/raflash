import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "module_addr";
const MODULE_NAME = "raflash";

export function executeTryFlash({ amount }) {
  return {
    type: "entry_function_payload",
    function: `MODULE_ADDRESS::MODULE_NAME::try_flash`,
    type_arguments: [],
    arguments: [amount],
  };
}
