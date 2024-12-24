import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import idl from "./poip.json";
import {Poip} from "./poip"
import { AnchorProvider, BN, Program, ProgramAccount } from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { IPAccount } from "./types";

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
    
    return async (params: {ipid: PublicKey, link: string, intro: string})=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            console.log("PROGRAM ID", PROGRAM_ID_POIP)
            const txSign = await program.methods
                .createIpAccount(params.ipid, params.link, params.intro)
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
    
    return async (ipid: PublicKey)=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   ipid.toBuffer()], PROGRAM_ID_POIP)[0]
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

export const useTxUpdateIPAccountLink = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: PublicKey, newLink: string)=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const txSign = await program.methods
                .updateIpAccountLink(ipid, newLink)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Update Ip Account ${ipid} Link Success: ${txSign}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxUpdateIPAccountIntro = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: PublicKey, newIntro: string)=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const txSign = await program.methods
                .updateIpAccountIntro(ipid, newIntro)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Update Ip Account ${ipid} Intro Success: ${txSign}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxPublish = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (params: {
        ipid: PublicKey,
        price: number,
        goalcount: number,
        maxcount: number,
    })=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .publish(
                    params.ipid, 
                    new BN(params.price), 
                    new BN(params.goalcount), 
                    new BN(params.maxcount || 0))
                .accounts({
                    ciAccount: ciAccount,
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Publish Contract For ${params.ipid} Success: ${inst}`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
            console.error(error)
        }
    }
}

export const useTxPay = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: PublicKey)=>{
        const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
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

    return async (ipid: PublicKey)=>{
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
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

    return async (ipid: PublicKey)=>{
        try {
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
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

    return async (ipid: PublicKey)=>{
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
        const accountData = await program.account.cpAccount.fetchNullable(cpAccount)
        return accountData
    }
}

export const useGetPaymentWithAddress = ()=>{
    const program = useAnchorProgram()

    return async (ipid: PublicKey, address: Uint8Array)=>{
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), Buffer.from(address), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const accountData = await program.account.cpAccount.fetchNullable(cpAccount)
        return accountData
    }
}

export const useGetIPAccount  = ()=>{
    const program = useAnchorProgram()

    return async (ipid: PublicKey): Promise<IPAccount | null> =>{
        const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        return await program.account.ipAccount.fetchNullable(ipAccount)
    }
}

export const useGetAllIPAccounts = ()=>{
    const program = useAnchorProgram()

    return async (): Promise<ProgramAccount<IPAccount>[]> =>{
        return await program.account.ipAccount.all()
    }
}

export const useGetContractAccount = ()=>{
    const program = useAnchorProgram()

    return async (ipid: PublicKey): Promise<any> =>{
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        return await program.account.ciAccount.fetchNullable(ciAccount)
    }
}