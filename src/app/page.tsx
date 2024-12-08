"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NoSSR from "../utils/NoSSR";
import React, { useEffect, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import IPUpload from "@/components/IPUpload";
import { storageInitialize } from "@/utils/ipfs/pinata";
import IPIndex from "@/components/IPIndex";

const Home = () => {

  const init = useInitHooks()
  useEffect(()=>{init()}, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
        <NoSSR>
          <WalletMultiButton/>
          <IPUpload/>
          <IPIndex/>
          <Toaster/>
        </NoSSR>
    </main>
  );
}

const useInitHooks = ()=>{
  return async ()=>{
    await storageInitialize()
  }
}

export default Home