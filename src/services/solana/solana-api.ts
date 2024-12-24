import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import idl from "./poip.json";
import {Poip} from "./poip"
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { IPAccount, IpContractType } from "./types";

export const PROGRAM_ID_POIP = new PublicKey(idl.metadata.address)
// export const NETWORK = "https://api.devnet.solana.com"
export const NETWORK = "http://127.0.0.1:8899"
const connection = new Connection(NETWORK, "processed");

export const useAnchorProgram = ()=>{
    const wallet = useAnchorWallet()
    const provider = new AnchorProvider(connection, wallet!, {preflightCommitment: "processed"})
    //@ts-ignore
    return new Program(idl, PROGRAM_ID_POIP, provider) as Program<Poip>
}

export const useTxCreateIPAccount = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()
    
    return async (params: {ipid: string, link: string})=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   Buffer.from(params.ipid)], PROGRAM_ID_POIP)[0]
            console.log("PROGRAM ID", PROGRAM_ID_POIP)
            const txSign = await program.methods
                .createIpAccount(params.ipid, params.link)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Create Ip Account ${params.ipid} Success: ${txSign}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxDeleteIPAccount = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()
    
    return async (ipid: string)=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .deleteIpAccount(ipid)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Delete Ip Account ${ipid} Success: ${inst}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxPublish = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (props: {
        ipid: string,
        price: number,
        goalcount: number,
        maxcount: number,
        contractType: IpContractType
    })=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), Buffer.from(props.ipid)], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), Buffer.from(props.ipid)], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .publish(
                    props.ipid, 
                    new BN(props.price), 
                    new BN(props.goalcount), 
                    new BN(props.maxcount || 0), 
                    new BN(props.contractType))
                .accounts({
                    ciAccount: ciAccount,
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Publish Contract For ${props.ipid} Success: ${inst}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxPay = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: string)=>{
        const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
        const inst = await program.methods
            .pay(ipid)
            .accounts({
                cpAccount: cpAccount,
                ciAccount: ciAccount,
                ipAccount: ipAccount,
                signer: wallet.publicKey!,
                systemProgram: SystemProgram.programId
            }).rpc()
        toast.success(`Tx Pay For ${ipid} Success: ${inst}`)
    }
}

export const useTxWithdraw = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: string)=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
            const ownerAccount = PublicKey.findProgramAddressSync([Buffer.from("user"), wallet.publicKey!.toBuffer()], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .withraw(ipid)
                .accounts({
                    ciAccount: ciAccount,
                    ipAccount: ipAccount,
                    ownerAccount: ownerAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Withdraw From Contract ${ipid} Success: ${inst}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxBonus = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: string)=>{
        try {
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
            const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
            const userAccount = PublicKey.findProgramAddressSync([Buffer.from("user"), wallet.publicKey!.toBuffer()], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .bonus(ipid)
                .accounts({
                    ciAccount: ciAccount,
                    cpAccount: cpAccount,
                    userAccount: userAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Withdraw From Contract ${ipid} Success: ${inst}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxReclaim = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async ()=>{
        try {
            const userAccount = PublicKey.findProgramAddressSync([Buffer.from("user"), wallet.publicKey!.toBuffer()], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .deleteUserAccount()
                .accounts({
                    userAccount: userAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Reclaim Token Success: ${inst}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useGetBalance = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async ()=>{
        try {
            const lamports = (await program.account.userAccount.getAccountInfo(wallet.publicKey!))!.lamports
            toast.success(`Balance In User Account: ${lamports / LAMPORTS_PER_SOL} SOL`)
        } catch(error: any) {
            toast.error(`Get Balance Fail...`)
            console.error(error)
        }
    }
}

export const useGetPayment = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: string)=>{
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
        const accountData = await program.account.cpAccount.fetchNullable(cpAccount)
        return accountData
    }
}

export const useGetPaymentWithAddress = ()=>{
    const program = useAnchorProgram()

    return async (ipid: string, address: Uint8Array)=>{
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), Buffer.from(address), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
        const accountData = await program.account.cpAccount.fetchNullable(cpAccount)
        return accountData
    }
}

export const useGetIPAccount  = ()=>{
    const program = useAnchorProgram()

    return async (ipid: string): Promise<IPAccount | null> =>{
        const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
        return await program.account.ipAccount.fetchNullable(ipAccount)
    }
}

export const useGetContractAccount = ()=>{
    const program = useAnchorProgram()

    return async (ipid: String): Promise<any> =>{
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), Buffer.from(ipid)], PROGRAM_ID_POIP)[0]
        return await program.account.ciAccount.fetchNullable(ciAccount)
    }
}