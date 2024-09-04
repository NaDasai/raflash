import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { BuyTicket } from "@/components/BuyTicket";
import { RepayTicket } from "@/components/RepayTicket";
import { TryFlashLoan } from "@/components/TryFlashLoan";
import { DrawWinner } from "@/components/DrawWinner";

function App() {
  const { connected } = useWallet();

  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
            <BuyTicket/>
            <RepayTicket/>
            <DrawWinner/>
            <TryFlashLoan/>
            </CardContent>
          </Card>
        ) : (
          <CardHeader>
            <CardTitle>To get started Connect a wallet</CardTitle>
          </CardHeader>
        )}
      </div>
    </>
  );
}

export default App;
