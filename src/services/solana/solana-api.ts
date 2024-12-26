import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import idl from "./poip.json";
import {Poip} from "./poip"
import { AnchorProvider, BN, Program, ProgramAccount } from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { CPAccount, IPAccount } from "./types";
import { useState, useEffect, useCallback } from 'react';

export const PROGRAM_ID_POIP = new PublicKey(idl.metadata.address)

// Create a React Context to manage the network
export let _network: string = "https://api.devnet.solana.com"; // Default value
export let _connection: Connection = new Connection(_network, "processed");

export const useNetworkConfiguration = () => {
    
    const [network, setNetwork] = useState<string>(_network);

    const updateNetwork = useCallback((newNetwork: string) => {
        console.log("Network Change From: ", _network)
        _network = newNetwork;
        try {
            _connection = new Connection(_network, "processed");
            console.log("Network Change To: ", _network)
        } catch (error) {
            console.error("Error creating connection:", error);
            // Optionally revert to the previous network or show an error message
        }
        setNetwork(newNetwork);
    }, []);

    return { network, updateNetwork };
};

export const useAnchorProgram = ()=>{
    const wallet = useAnchorWallet();
    const [program, setProgram] = useState<Program<Poip> | null>(null);

    useEffect(() => {
        if (wallet) {
            const provider = new AnchorProvider(_connection, wallet, { preflightCommitment: "processed" })
            //@ts-ignore
            setProgram(new Program(idl, PROGRAM_ID_POIP, provider) as Program<Poip>);
        } 
    }, [wallet]);

    return program;
}

export const useTxCreateIPAccount = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (params: {ipid: PublicKey, link: string, intro: string})=>{
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            console.log("PROGRAM ID", PROGRAM_ID_POIP)
            await program.methods
                .createIpAccount(params.ipid, params.link, params.intro)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Create Ip Account Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            await program.methods
                .deleteIpAccount(ipid)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Delete Ip Account Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            await program.methods
                .updateIpAccountLink(ipid, newLink)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Update Ip Account Link Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"),   ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            await program.methods
                .updateIpAccountIntro(ipid, newIntro)
                .accounts({
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Update Ip Account Intro Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            await program.methods
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
            toast.success(`Tx Publish Contract Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
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
        toast.success(`Tx Pay Success`)
    }
}

export const useTxWithdraw = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (ipid: PublicKey)=>{
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
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
            toast.success(`Tx Withdraw From Contract Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
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
            toast.success(`Tx Withdraw From Contract Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const userAccount = PublicKey.findProgramAddressSync([Buffer.from("user"), wallet.publicKey!.toBuffer()], PROGRAM_ID_POIP)[0]
            const inst = await program.methods
                .deleteUserAccount()
                .accounts({
                    userAccount: userAccount,
                    signer: wallet.publicKey!,
                    systemProgram: SystemProgram.programId
                }).rpc()
            toast.success(`Tx Reclaim Token Success`)
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
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
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
        if (!program) {
            toast.error("Program not initialized.");
            return null;
        }
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
        return await program.account.cpAccount.fetchNullable(cpAccount)
    }
}

export const useGetPaymentWithAddress = ()=>{
    const program = useAnchorProgram()
    return async (ipid: PublicKey, address: Uint8Array)=>{
        if (!program) {
            toast.error("Program not initialized.");
            return null;
        }
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), Buffer.from(address), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        return await program.account.cpAccount.fetchNullable(cpAccount)
    }
}

export const useGetIPAccount  = ()=>{
    const program = useAnchorProgram()
    return async (ipid: PublicKey): Promise<IPAccount | null> =>{
        if (!program) {
            toast.error("Program not initialized.");
            return null;
        }
        const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        return await program.account.ipAccount.fetchNullable(ipAccount)
    }
}

export const useGetAllIPAccounts = ()=>{
    const program = useAnchorProgram()
    return async (): Promise<ProgramAccount<IPAccount>[]> =>{
        if (!program) {
            toast.error("Program not initialized.");
            return [];
        }
        return await program.account.ipAccount.all()
    }
}

export const useGetAllPaymentAccounts = ()=>{
    const program = useAnchorProgram()
    return async (): Promise<ProgramAccount<CPAccount>[]>=>{
        if (!program) {
            toast.error("Program not initialized.");
            return [];
        }
        return await program.account.cpAccount.all()
    }
}

export const useGetContractAccount = ()=>{
    const program = useAnchorProgram()
    return async (ipid: PublicKey): Promise<any> =>{
        if (!program) {
            toast.error("Program not initialized.");
            return [];
        }
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        return await program.account.ciAccount.fetchNullable(ciAccount)
    }
}