import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";

const MODULE_ADDRESS = "module_addr";
const MODULE_NAME = "raflash";

export function DrawWinner() {
  const { signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleDrawWinner = async () => {
    setIsLoading(true);
    try {
      const transaction = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::draw`,
          functionArguments: [],
        },
      });

      await aptosClient.waitForTransaction({ transactionHash: transaction.hash });

      toast({
        title: "Winner Drawn",
        description: "A winner has been successfully drawn.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Draw Failed",
        description: "There was an error drawing the winner.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-md">
      <Button
        onClick={handleDrawWinner}
        disabled={isLoading}
        className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
      >
        {isLoading ? "Drawing..." : "Draw Winner"}
      </Button>
    </div>
  );
}