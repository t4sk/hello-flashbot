import { providers, Wallet } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";

const GWEI = 10n ** 9n;
const ETHER = 10n ** 18n;

const CHAIN_ID = 5; // goerli
const FLASHBOTS_ENDPOINT = "https://relay-goerli.flashbots.net";

const provider = new providers.JsonRpcProvider({
  // @ts-ignore
  url: process.env.ETH_RPC_URL,
});

// @ts-ignore
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

async function main() {
  const signer = new Wallet(
    "0x2000000000000000000000000000000000000000000000000000000000000000"
  );
  //   const signer = Wallet.createRandom();
  const flashbot = await FlashbotsBundleProvider.create(
    provider,
    signer,
    FLASHBOTS_ENDPOINT
  );
  provider.on("block", async (block) => {
    console.log(`block: ${block}`);

    const signedTx = await flashbot.signBundle([
      {
        signer: wallet,
        transaction: {
          chainId: CHAIN_ID,
          // TODO: what is type?
          type: 2,
          value: 0,
          data: "0x",
          maxFeePerGas: GWEI * 3n,
          maxPriorityFeePerGas: GWEI * 2n,
          gasLimit: 1000000,
          to: "0x26C4ca34f722BD8fD23D58f34576d8718c883A80",
        },
      },
    ]);

    const sim = await flashbot.simulate(signedTx, block + 1);

    if ("error" in sim) {
      console.log(`simulation error: ${sim.error.message}`);
    } else {
      console.log(`simulation success: ${JSON.stringify(sim, null, 2)}`);
    }

    // TODO: how to stop on success?
    const res = await flashbot.sendRawBundle(signedTx, block + 1);
    console.log("RES", res);
  });
}

main();
