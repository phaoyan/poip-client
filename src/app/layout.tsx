
import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "../utils/AppWalletProvider";
import { font } from "@/utils/font";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const RootLayout = ({children}: any) => {
  return (
    <html>
      <body className={font.className}>
        <AppWalletProvider>{children}</AppWalletProvider> 
      </body>
    </html>
  );
}

export default RootLayout