// integration.ts
import { useWallet } from '@solana/wallet-adapter-react';
import { decrypt, encrypt } from './cryptography';
import { deleteFile, extractCid, uploadFile } from './pinata';
import { useGetIPAccount, useGetPayment, useTxCreateIPAccount, useTxPay, useTxUpdateIPAccountIntro, useTxUpdateIPAccountLink } from './solana-api';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { IPMetadata } from './types';
import { PublicKey } from '@solana/web3.js';

export const useCreateIPAndEncrypt = () => {
    const getIPAccount = useGetIPAccount();
    const createIPAccount = useTxCreateIPAccount();

    return async (
        file: File, 
        ipid: PublicKey, 
        metadata: IPMetadata, 
        pinataJwt: string, 
        pinataGateway: string
    ): Promise<{keyBase64: string, ivBase64: string} | undefined> => {
        try {

            // IPID 查重
            const ipAccount = await getIPAccount(ipid)
            if (ipAccount) {
                console.error('IPID Already Exists :', ipid);
                return
            }

            // 1. Encrypt the file
            const { encryptedBlob, keyBase64, ivBase64 } = await encrypt(file);
            console.log(`Encryption Key (Base64):${keyBase64}, IV (Base64): ${ivBase64}`);

            // 2. Upload the encrypted blob to IPFS using Pinata
            const contentResponse = await uploadFile(new File([encryptedBlob], metadata.filename + '.encrypted'), pinataJwt, pinataGateway);
            const contentIpfsHash = contentResponse.IpfsHash;
            console.log('Encrypted file uploaded to IPFS with CID:', contentIpfsHash);

            // 3. Upload Intro JSON to IPFS using Pinata
            // 把metadata转化成blob存进文件里
            const metadataString = JSON.stringify(metadata);
            const metadataBlob = new Blob([metadataString], { type: 'application/json' });
            const introResponse = await uploadFile(new File([metadataBlob], file.name + '.json'), pinataJwt, pinataGateway)
            const introIpfsHash = introResponse.IpfsHash;

            const contentLink = `https://${pinataGateway}/ipfs/${contentIpfsHash}`;
            const introLink = `https://${pinataGateway}/ipfs/${introIpfsHash}`
            await createIPAccount({ ipid: ipid, link: contentLink, intro: introLink });
            console.log(`IP Account created on Solana with IPID: ${ipid}`);
            console.log(`Content Link: ${contentLink}`)
            console.log(`Intro Link: ${introLink}`)
        
            return {keyBase64, ivBase64}
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
    const pingSkServer = usePingSkServer()

    return async ({ ipid }: { ipid: PublicKey }) => { //sks: secret key server
        if (!wallet.publicKey) {
            console.error("Wallet not connected.");
            return;
        }

        try {

            // 1. Get IP Account to retrieve the IPFS link and Check SK Server Availability
            const ipAccountData = await getIPAccount(ipid);
            if (!ipAccountData || !ipAccountData.link) {
                console.error("IP Account data or IPFS link not found.");
                return;
            }

            const ipMetadata: IPMetadata = await (await fetch(ipAccountData.intro)).json()
            const sksUrl = ipMetadata.sksUrl
            const ping = await pingSkServer(sksUrl, ipid.toBase58())
            if(!ping) {
                toast.error("密钥服务暂未运行，请联系作者部署密钥服务...")  
                return
            }

            // 2. Initiate Solana Purchase Transaction
            if (!await getPayment(ipid)) {
                try {
                    await txPay(ipid);
                } catch (err: any) {
                    console.error("Transaction Fail ... ", err)
                    return
                }
            } else {
                toast.success("已有购买记录，直接获取资源 ... ")
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
                saveAs(decryptedBlob, ipMetadata.filename || "Poip-Solana-IP-Content.pdf"); // You can customize the filename
                console.log("File purchased and decrypted successfully!");

                return true
            } else {
                console.error("File decryption failed in the decrypt function.");
            }
        } catch (error) {
            console.error("Purchase and decryption process failed:", error);
        }
    };
};

export const useUpdateIntroFile = () => {
    const getIPAccount = useGetIPAccount();
    const updateIPAccountIntro = useTxUpdateIPAccountIntro();

    return async (ipid: PublicKey, newIntroFile: File, metadata: IPMetadata, pinataJwt: string, pinataGateway: string) => {
        try {

            // 1. Get the existing IP Account (Optional but Recommended)
            const existingIPAccount = await getIPAccount(ipid);
            if (!existingIPAccount) {
                console.error('IP Account not found:', ipid);
                toast.error('IP Account not found.');
                return;
            }

            // 2. Upload the new intro file to IPFS using Pinata
            const introMetadataString = JSON.stringify({ ...metadata, ipid: ipid.toBase58() });
            const introMetadataBlob = new Blob([introMetadataString], { type: 'application/json' });
            const introResponse = await uploadFile(new File([introMetadataBlob], newIntroFile.name), pinataJwt, pinataGateway);
            const introIpfsHash = introResponse.IpfsHash;
            const newIntroLink = `https://${pinataGateway}/ipfs/${introIpfsHash}`;

            console.log('New intro file uploaded to IPFS with CID:', introIpfsHash);
            console.log('New Intro Link:', newIntroLink);

            // 3. Update the IP Account with the new intro link using useTxUpdateIPAccountIntro
            await updateIPAccountIntro(ipid, newIntroLink);

            // 4. Delete Original File
            const oriCid = extractCid(existingIPAccount.intro)
            oriCid && await deleteFile(oriCid, pinataJwt, pinataGateway)

            toast.success(`IP Account intro updated successfully for IPID: ${ipid}`);

        } catch (error) {
            console.error('Error updating intro file:', error);
            toast.error(`Error updating intro file: ${error}`);
        }
    };
};

export const useUpdateLinkFile = () => {
    const getIPAccount = useGetIPAccount();
    const updateIPAccountLink = useTxUpdateIPAccountLink();

    return async (ipid: PublicKey, newLinkFile: File, pinataJwt: string, pinataGateway: string) => {
        try {
            // 2. Get the existing IP Account (Optional but Recommended)
            const existingIPAccount = await getIPAccount(ipid);
            if (!existingIPAccount) {
                console.error('IP Account not found:', ipid);
                toast.error('IP Account not found.');
                return;
            }

            // 1. Upload the new link file to IPFS using Pinata
            const linkResponse = await uploadFile(newLinkFile, pinataJwt, pinataGateway);
            const newLinkIpfsHash = linkResponse.IpfsHash;
            const newLink = `${pinataGateway}/ipfs/${newLinkIpfsHash}`;

            console.log('New link file uploaded to IPFS with CID:', newLinkIpfsHash);
            console.log('New Link:', newLink);



            // 3. Update the IP Account with the new link using useTxUpdateIPAccountLink
            await updateIPAccountLink(ipid, newLink);


            // 4. Delete Original File
            const oriCid = extractCid(existingIPAccount.link)
            oriCid && await deleteFile(oriCid, pinataJwt, pinataGateway)


            toast.success(`IP Account link updated successfully for IPID: ${ipid}`);

        } catch (error) {
            console.error('Error updating link file:', error);
            toast.error(`Error updating link file: ${error}`);
        }
    };
};

export const usePingSkServer = ()=>{
    return async (sksUrl: string, ipid: string)=>{
        try {
            const resp = await fetch(`${sksUrl}/ping`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ipid })});
            if(!resp.ok) return false
            return true
        } catch(err: any) {
            return false
        }
    }
}

export const useFetchDecryptionKey = () => {
    const wallet = useWallet();

    return async ({ ipid, sksUrl }: { ipid: PublicKey; sksUrl: string }): Promise<{ keyBase64: string, ivBase64: string } | null> => {
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
                    ipid: ipid.toBase58(),
                }),
            });

            if (!decryptionResponse.ok) {
                const errorData = await decryptionResponse.json();
                console.error("Decryption server error:", errorData);
                throw new Error(`Failed to get decryption key: ${errorData.error}`);
            }

            const data = await decryptionResponse.json();
            return { keyBase64: data.key, ivBase64: data.iv }
        } catch (error) {
            console.error("Error fetching decryption key:", error);
            return null;
        }
    }
};