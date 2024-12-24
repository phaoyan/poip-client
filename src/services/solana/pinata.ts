import { PinataSDK as PinataIPFSSDK } from "pinata-web3";
import { PINATA_IPDATA_GROUP } from "../../utils/Constants";

export const PINATA_CONFIG = {
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYjNkNjgwOS1mOGE3LTQyOWMtOWQ1Yi1iODhkMzEzMWE4M2QiLCJlbWFpbCI6InRvbWF0b3F3cUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzg0N2JlZDEzNTY4ZGZhZDA2MDIiLCJzY29wZWRLZXlTZWNyZXQiOiJiODIxNzZmNjYxMDk0NGZhMmQ1NTFiYTQ0MmVmNWFmYzY2NDcyNzgzYjA2NTEzODljYmZlN2U3NzEwY2Y0ZDFiIiwiZXhwIjoxNzY1MDMzMzA0fQ.ycCJqgcMB253oPItT5LsvhOxPpc_xaKmu9gbPptUFcs",
  pinataGateway: "harlequin-blank-quail-554.mypinata.cloud",
}

export const pinata = new PinataIPFSSDK(PINATA_CONFIG)


export const storageInitialize = async ()=>{
  const ipdataGroup = await pinata.groups.list().name(PINATA_IPDATA_GROUP).all()
  ipdataGroup.length===0 && await pinata.groups.create({name: PINATA_IPDATA_GROUP})
}

export const getGroup = async (name: string) => {
  return (await pinata.groups.list().name(name).all()).at(0)
}

export const uploadFile = async (file: File)=>{
  const groupId = (await getGroup(PINATA_IPDATA_GROUP))!.id
  return await pinata.upload.file(file, {groupId: groupId!})
}

export const getFile = async (cid: string)=>{
  return await pinata.gateways.get(cid)
}

export const deleteFile = async (cid: string) => {
  try {
    await pinata.unpin([cid]);
    console.log(`Successfully deleted file with CID: ${cid}`);
  } catch (error) {
    console.error(`Error deleting file with CID: ${cid}`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const updateFile = async (cid: string, newFile: File): Promise<string> => {
  try {
    await deleteFile(cid);
    const uploadResponse = await uploadFile(newFile);
    return uploadResponse.IpfsHash;
  } catch (error) {
    console.error(`Error updating file with CID: ${cid}`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};