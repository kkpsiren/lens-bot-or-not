import Head from "next/head";
import { useAccount } from "wagmi";
import { Web3Button } from "@web3modal/react";

export function MainPage() {
  return (
    <>
      <Head>
        <title>SNELLENS</title>
        <meta name="description" content="SNELLENS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-between ml-1">
        <div className="flex-col justify-center mx-auto mt-10 align-middle lg:mt-6">
          <Web3Button icon="show" label="Connect Wallet" balance="show" />
          <div className="text-2xl">Bot or Not 👀</div>
        </div>
        <div className="mt-3 mr-3 text-center text-l">
          👀
          <br />
          Bot or Not
          <br />
          Compare your assets
          <br />
          Attest your results on-chain
          <br />
          Help us make the data better on Lens 🌿
        </div>
      </div>
    </>
  );
}
