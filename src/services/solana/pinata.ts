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

export const uploadIPFile = async (ipFile: File)=>{
  const groupId = (await getGroup(PINATA_IPDATA_GROUP))!.id
  return await pinata.upload.file(ipFile, {groupId: groupId!})
}

export const getIPFile = async (cid: string)=>{
  return await pinata.gateways.get(cid)
}
