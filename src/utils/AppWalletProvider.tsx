"use client";
 
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { NETWORK } from "../services/solana/solana-api";
 
// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

const AppWalletProvider = ({children}: any) => {
    const network = NETWORK;
    const wallets = useMemo(
      () => [
        // manually add any legacy wallet adapters here
        // new UnsafeBurnerWalletAdapter(),
      ],
      [network],
    );
   
    return (
      <ConnectionProvider endpoint={NETWORK}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }

export default AppWalletProvider