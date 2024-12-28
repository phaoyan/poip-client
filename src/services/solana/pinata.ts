import { PinataSDK } from "pinata-web3";
import toast from "react-hot-toast";


export const getPinata = (pinataJwt: string, pinataGateway: string) => {
  try {
    return new PinataSDK({ pinataJwt, pinataGateway });
  } catch (error) {
    toast.error("Error initializing Pinata SDK. Please check your configuration.");
    console.error("Error initializing Pinata SDK:", error);
    throw new Error("Failed to initialize Pinata SDK.");
  }
};

export const uploadFile = async (file: File, pinataJwt: string, pinataGateway: string) => {
  const pinata = getPinata(pinataJwt, pinataGateway);
  return await pinata.upload.file(file);
};

export const deleteFile = async (cid: string, pinataJwt: string, pinataGateway: string) => {
  const pinata = getPinata(pinataJwt, pinataGateway);
  try {
    await pinata.unpin([cid]);
    console.log(`Successfully deleted file with CID: ${cid}`);
  } catch (error) {
    console.error(`Error deleting file with CID: ${cid}`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const updateFile = async (cid: string, newFile: File, pinataJwt: string, pinataGateway: string): Promise<string> => {
  try {
    await deleteFile(cid, pinataJwt, pinataGateway);
    const uploadResponse = await uploadFile(newFile, pinataJwt, pinataGateway);
    return uploadResponse.IpfsHash;
  } catch (error) {
    console.error(`Error updating file with CID: ${cid}`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const extractCid = (url: string): string | null => {
  const regex = /\/([a-zA-Z0-9]+)$/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};