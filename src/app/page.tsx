// src/app/page.tsx
"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NoSSR from "../utils/NoSSR";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";

const Home = () => {

  const init = useInitHooks()
  useEffect(()=>{init()}, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
        <NoSSR>
          <WalletMultiButton/>
          <Toaster/>
        </NoSSR>
    </main>
  );
}

const useInitHooks = ()=>{
  return async ()=>{}
}

export default Home