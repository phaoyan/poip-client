"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NoSSR from "../utils/NoSSR";
import React, { useEffect, useCallback, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { useCreateIPAndEncrypt, usePurchaseAndDecrypt } from "@/services/solana/poip-service";
import { useGetContractAccount, useGetIPAccount, useGetPayment, useTxPublish } from "@/services/solana/solana-api";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { GOALMAX_BUYOUT } from "@/services/solana/types";

const Home = () => {

  const createIPAndEncrypt = useCreateIPAndEncrypt()
  const purchaseAndDecrypt = usePurchaseAndDecrypt()
  const getIPAccount       = useGetIPAccount()
  const getContractAccount = useGetContractAccount()
  const getPayment         = useGetPayment()
  const txPublish          = useTxPublish()

  const init = useInitHooks()
  useEffect(()=>{init()}, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
        <NoSSR>
          <WalletMultiButton/>
          <br/>
          <FileUploadButton onFileUploaded={async (file)=> await createIPAndEncrypt(file, "poip-solana")}/>
          <br/>
          <button onClick={async ()=>{console.log("IP Account", await getIPAccount("poip-solana"))}}>检查IP Account</button>
          <br/>
          <button onClick={async ()=>{
            await txPublish({
              ipid: "poip-solana", 
              price: 0.01 * LAMPORTS_PER_SOL, 
              goalcount: 5, 
              maxcount: 10, 
              contractType: GOALMAX_BUYOUT
            })}}>发布GM Contract</button>
          <br/>
          <button onClick={async ()=>{
            console.log("Contract Account: ", await getContractAccount("poip-solana"))
          }}>
            检查Contract
          </button>
          <br/>
          <button onClick={async ()=>{
            await purchaseAndDecrypt({
              ipid: "poip-solana", 
              sksUrl: "http://localhost:4000"
            })
          }}>测试购买流程</button>
          <br/>
          <button onClick={async ()=>{
            console.log("Payment Account : ", await getPayment("poip-solana"))
          }}>
            检查购买记录
          </button>

          <Toaster/>
        </NoSSR>
    </main>
  );
}

const useInitHooks = ()=>{
  return async ()=>{}
}

export const FileUploadButton: React.FC<{
  onFileUploaded: (file: File) => Promise<void>;
}> = ({ onFileUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      await onFileUploaded(file);
      // 清空 input，以便用户可以再次上传同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onFileUploaded]);

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div>
      <button onClick={handleClick}>选择文件</button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Home