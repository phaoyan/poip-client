'use client'

import "./globals.css";
import AppWalletProvider from "../utils/AppWalletProvider";
import { font } from "@/utils/font";
import PageTitleBar from "@/components/layout/PageTitleBar";
import { Toaster } from "react-hot-toast";

const RootLayout = ({children}: any) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Poip Solana</title>
      </head>
      <body className={font.className}>
        <AppWalletProvider>
          <div>
            <PageTitleBar/>
              {children}
            <Toaster/>
          </div>  
        </AppWalletProvider> 
      </body>
    </html>
  );
}

export default RootLayout