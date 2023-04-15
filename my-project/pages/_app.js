import "../styles/globals.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { configureChains, createClient, WagmiConfig } from "wagmi";

import { polygon } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const chains = [polygon];
const { provider } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors: w3mConnectors({
    version: 2,
    chains,
    projectId,
  }),
  provider,
});

const ethereumClient = new EthereumClient(wagmiClient, chains);

function MyApp({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <main className={`${inter.variable} font-sans`}>
      {ready ? (
        <WagmiConfig client={wagmiClient}>
          {<Component {...pageProps} />}
        </WagmiConfig>
      ) : null}
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </main>
  );
}

export default MyApp;
