"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NoSSR from "../utils/NoSSR";
import React from "react";
import { Toaster } from "react-hot-toast";
import IPUpload from "@/components/IPUpload";
import { setupW3s, w3s } from "@/utils/ipfs/w3s";

const Home = () => {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
        <NoSSR>
          <WalletMultiButton/>
          <div>
            <span>{w3s.currentSpace()?.name}</span>
            <button onClick={()=>setupW3s("tomatoqwq@gmail.com", "juumii")}>w3s setup</button>
          </div>
          <IPUpload/>
          <Toaster/>
        </NoSSR>


    </main>
  );
}

export default Home