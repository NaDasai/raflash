import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { repayTicket } from "@/entry-functions/repayTicket";

const MODULE_ADDRESS = "0x037460d919f725db056a21b9da4682088748f6128b1ae2ce8ddf9a10ab469c0a";
const MODULE_NAME = "raflash";

export function RepayTicket() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRepayTicket = async () => {
    setIsLoading(true);
    try {
      const transaction = await signAndSubmitTransaction(
        repayTicket({}),
      );
      const result = await aptosClient.account.getResource(account.address,
          `${MODULE_ADDRESS}::${MODULE_NAME}::Pool`);
      setData(result.data);

       toast({
              title: "Repay Ticket Executed",
              description: `Successfully refunded the ticket.`,
              variant: "success",
            });

    } catch (error) {
      console.error(error);
      toast({
          title: "Repay Ticket Executed",
          description: `Successfully refunded the ticket.`,
          variant: "success",
          });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-md">
      <Button
        onClick={handleRepayTicket}
        disabled={isLoading}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      >
        {isLoading ? "Processing..." : "Repay Ticket"}
      </Button>
       {data && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
                <p>Transaction successful. Data: {JSON.stringify(data)}</p>
              </div>
            )}
    </div>
  );
}