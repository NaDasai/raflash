import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MODULE_ADDRESS = "module_addr";
const MODULE_NAME = "raflash";

function executeTryFlash({ amount }) {
  return {
    type: "entry_function_payload",
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::try_flash`,
    type_arguments: [],
    arguments: [amount],
  };
}

export function TryFlashLoan() {
  const { signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleTryFlashLoan = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for the loan amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const transaction = await signAndSubmitTransaction(executeTryFlash({ amount: Number(amount) }));
      
      await aptosClient.waitForTransaction({ transactionHash: transaction.hash });
      
      toast({
        title: "Flash Loan Executed",
        description: `Successfully executed a flash loan for ${amount} tokens.`,
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Flash Loan Failed",
        description: "There was an error executing the flash loan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Try Flash Loan</h2>
      <Input
        type="number"
        placeholder="Enter loan amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full max-w-xs"
      />
      <Button
        onClick={handleTryFlashLoan}
        disabled={isLoading || !amount}
        className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        {isLoading ? "Processing..." : "Execute Flash Loan"}
      </Button>
    </div>
  );
}