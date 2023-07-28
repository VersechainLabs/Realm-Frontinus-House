import { Wallet } from "@ethersproject/wallet";
import { ApiWrapper } from "../src";
import { Auction, Direction, Proposal, Vote } from "../src/builders";

const run = async () => {
  const exampleWallet = Wallet.fromMnemonic(
    "test test test test test test test test test test test junk"
  );

  const local = new ApiWrapper("http://localhost:3000", exampleWallet);


  if (process.argv.length !== 3) {
    console.log('usage: yarn vote <proposal number>')
    process.exit(2)
  }

  try {
		const newVote = await local.logVote(new Vote(Direction.Up, Number(process.argv[2])))
  } catch (e: any) {
    console.log(e.response.data);
  }
};

run();
