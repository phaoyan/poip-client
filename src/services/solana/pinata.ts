import { PinataSDK as PinataIPFSSDK } from "pinata-web3";
import toast from "react-hot-toast";

// export const PINATA_CONFIG = {
//   pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYjNkNjgwOS1mOGE3LTQyOWMtOWQ1Yi1iODhkMzEzMWE4M2QiLCJlbWFpbCI6InRvbWF0b3F3cUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzg0N2JlZDEzNTY4ZGZhZDA2MDIiLCJzY29wZWRLZXlTZWNyZXQiOiJiODIxNzZmNjYxMDk0NGZhMmQ1NTFiYTQ0MmVmNWFmYzY2NDcyNzgzYjA2NTEzODljYmZlN2U3NzEwY2Y0ZDFiIiwiZXhwIjoxNzY1MDMzMzA0fQ.ycCJqgcMB253oPItT5LsvhOxPpc_xaKmu9gbPptUFcs",
//   pinataGateway: "harlequin-blank-quail-554.mypinata.cloud",
// }

export const getPinata = (pinataJwt: string, pinataGateway: string) => {
  try {
    return new PinataIPFSSDK({ pinataJwt, pinataGateway });
  } catch (error) {
    toast.error("Error initializing Pinata SDK. Please check your configuration.");
    console.error("Error initializing Pinata SDK:", error);
    throw new Error("Failed to initialize Pinata SDK.");
  }
};

export const getGroup = async (name: string, pinataJwt: string, pinataGateway: string) => {
  const pinata = getPinata(pinataJwt, pinataGateway);
  return (await pinata.groups.list().name(name).all()).at(0);
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