import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { executeTryFlash } from "@/entry-functions/executeTryFlash";

const MODULE_ADDRESS = "0x037460d919f725db056a21b9da4682088748f6128b1ae2ce8ddf9a10ab469c0a";
const MODULE_NAME = "raflash";

export function TryFlashLoan() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleTryFlashLoan = async () => {
    setIsLoading(true);
    try {
      const transaction = await signAndSubmitTransaction(
          executeTryFlash({ amount: parseInt(amount)  }));
      const result = await aptosClient.waitForTransaction({transactionHash: transaction.hash});
      setData(result);

      toast({
        title: "Flash Loan Executed",
        description: `Successfully executed a flash loan for ${amount} tokens.`,
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Flash Loan Failed",
        description: `Successfully executed a flash loan for ${amount} tokens.`,
        variant: "default",
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
        className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        {isLoading ? "Processing..." : "Execute Flash Loan"}
      </Button>
    </div>
  );
}