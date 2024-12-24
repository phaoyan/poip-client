// integration.ts
import { useWallet } from '@solana/wallet-adapter-react';
import { decrypt, encrypt } from './cryptography';
import { PINATA_CONFIG, uploadIPFile } from './pinata';
import { useGetIPAccount, useGetPayment, useTxCreateIPAccount, useTxPay } from './solana-api';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';

export const useCreateIPAndEncrypt = () => {
    // 3. Create IP Account on Solana
    const getIPAccount    = useGetIPAccount();
    const createIPAccount = useTxCreateIPAccount();

    return async (file: File, ipid: string)=>{
        try {

            // IPID 查重
            const ipAccount = await getIPAccount(ipid)
            if(ipAccount){
                console.error('IPID Already Exists :', ipid);
                return
            }

            // 1. Encrypt the file
            const { encryptedBlob, keyBase64, ivBase64 } = await encrypt(file);
            console.log(`Encryption Key (Base64):${keyBase64}, IV (Base64): ${ivBase64}`);
    
            // 2. Upload the encrypted blob to IPFS using Pinata
            const pinataResponse = await uploadIPFile(new File([encryptedBlob], file.name + '.encrypted'));
            const ipfsHash = pinataResponse.IpfsHash;
            console.log('Encrypted file uploaded to IPFS with CID:', ipfsHash);
    
            const ipfsLink = `${PINATA_CONFIG.pinataGateway}/ipfs/${ipfsHash}`;
            await createIPAccount({ ipid: ipid, link: ipfsLink });
            console.log('IP Account created on Solana with IPID:', ipid, 'and IPFS Link:', ipfsLink);
            alert(`File encrypted, uploaded to IPFS, and IP Account created successfully!\nEncryption Key (Keep it safe!): ${keyBase64} (IV: ${ivBase64})\nIPFS CID: ${ipfsHash}\nSolana IP Account IPID: ${ipid}`);
        } catch (error) {
            console.error('Error processing file upload:', error);
            alert(`Error processing file upload: ${error}`);
        }
    }
}

export const usePurchaseAndDecrypt = () => {
    const wallet = useWallet();
    const txPay = useTxPay();
    const getPayment = useGetPayment();
    const getIPAccount = useGetIPAccount();
    const fetchDecryptionKey = useFetchDecryptionKey();

    return async ({ ipid, sksUrl }: { ipid: string, sksUrl: string }) => { //sks: secret key server
        if (!wallet.publicKey) {
            console.error("Wallet not connected.");
            return;
        }

        try {
            // 1. Initiate Solana Purchase Transaction
            if(!await getPayment(ipid)) {
                try {
                    await txPay(ipid);
                } catch(err: any) {
                    console.error("Transaction Fail ... ", err)
                    return
                }
            } else {
                toast.success("已有购买记录，直接获取资源 ... ")
            }

            // 2. Get IP Account to retrieve the IPFS link
            const ipAccountData = await getIPAccount(ipid);
            if (!ipAccountData || !ipAccountData.link) {
                console.error("IP Account data or IPFS link not found.");
                return;
            }

            // 3. Download Encrypted File from Pinata
            const encryptedFileResponse = await fetch(ipAccountData.link);
            if (!encryptedFileResponse.ok) {
                console.error("Failed to download encrypted file from IPFS.");
                return;
            }
            const encryptedBlob = await encryptedFileResponse.blob();

            // 4. Request Decryption Key from poip-sk-server
            const result = await fetchDecryptionKey({ ipid, sksUrl });
            if (!result) {
                console.error("Failed to retrieve decryption key.");
                return;
            }
            const { keyBase64, ivBase64 } = { keyBase64: result.keyBase64, ivBase64: result.ivBase64 }

             // 5. Decrypt the file using the separate decrypt function
            const decryptedBlob = await decrypt({ encryptedBlob, keyBase64, ivBase64 });

            // 6. Download Decrypted File
            if (decryptedBlob) {
                // 6. Download Decrypted File
                saveAs(decryptedBlob, ipid); // You can customize the filename
                console.log("File purchased and decrypted successfully!");
            } else {
                console.error("File decryption failed in the decrypt function.");
            }
        } catch (error) {
            console.error("Purchase and decryption process failed:", error);
        }
    };
};

export const useFetchDecryptionKey = () => {
    const wallet = useWallet();
  
    return async ({ ipid, sksUrl }: { ipid: string; sksUrl: string }): Promise<{keyBase64: string, ivBase64: string} | null>=>{
        if (!wallet.publicKey || !wallet.signMessage) {
            console.error("Wallet not connected or signMessage function not available.");
            return null;
        }
      
        try {
            const message = `Requesting decryption key for IPID: ${ipid}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await wallet.signMessage(encodedMessage);
            const signatureBase58 = bs58.encode(signature);
      
            const decryptionResponse = await fetch(`${sksUrl}/decrypt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    buyerPublicKey: wallet.publicKey.toBase58(),
                    signature: signatureBase58,
                    message: message,
                    ipid: ipid,
                }),
            });
      
            if (!decryptionResponse.ok) {
                const errorData = await decryptionResponse.json();
                console.error("Decryption server error:", errorData);
                throw new Error(`Failed to get decryption key: ${errorData.error}`);
            }
      
            const data =  await decryptionResponse.json();
            return {keyBase64: data.key, ivBase64: data.iv}
        } catch (error) {
            console.error("Error fetching decryption key:", error);
            return null;
        }
    }
};