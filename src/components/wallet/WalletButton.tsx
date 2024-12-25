// src/app/page.tsx
"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NoSSR from "@/utils/NoSSR";
import React from "react";

const WalletButton = () => {

  return (
    <NoSSR>
        <WalletMultiButton style={{backgroundColor: "#fff", color: "#666", fontSize: "1.1em"}}/>
    </NoSSR>
  );
}

export default WalletButton