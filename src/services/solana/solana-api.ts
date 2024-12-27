import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js"
import idl from "./poip.json";
import {Poip} from "./poip"
import { AnchorProvider, BN, Program, ProgramAccount, web3 } from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { CPAccount, IPAccount } from "./types";
import { useState, useEffect, useCallback } from 'react';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

export const PROGRAM_ID_POIP = new PublicKey(idl.metadata.address)

// Create a React Context to manage the network
// export let _network: string = "https://api.devnet.solana.com"; // Default value
export let _network: string = "http://localhost:8899"; // Default value
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
        tokenMint: PublicKey
    })=>{
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciTokenAccount = anchor.utils.token.associatedAddress({ mint: params.tokenMint, owner: ciAccount });
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
                    tokenMint: params.tokenMint,
                    ciTokenAccount: ciTokenAccount,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: web3.SYSVAR_RENT_PUBKEY,
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

    return async (params: {ipid: PublicKey})=>{
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const ciData = await program.account.ciAccount.fetch(ciAccount);
        const payerTokenAccount = anchor.utils.token.associatedAddress({ mint: ciData.tokenMint, owner: wallet.publicKey! });
        const ciTokenAccount = anchor.utils.token.associatedAddress({ mint: ciData.tokenMint, owner: ciAccount });
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
        try {
            const inst = await program.methods
                .pay(params.ipid)
                .accounts({
                    cpAccount: cpAccount,
                    ciAccount: ciAccount,
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    payerTokenAccount: payerTokenAccount,
                    ciTokenAccount: ciTokenAccount,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                }).instruction()

            const transaction = new web3.Transaction().add(inst)
            const signature   = await wallet.sendTransaction(transaction, _connection)
            const txMessage   = transaction.serializeMessage()
            toast.success(`Tx Pay Success`)

            return {txMessage, signature}
        } catch (error) {
            toast.error(`Transaction Fail...`)
            console.error(error)
            return null;
        }
    }
}

export const useTxWithdraw = ()=>{
    const wallet = useWallet()
    const program = useAnchorProgram()

    return async (params: {ipid: PublicKey})=>{
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ipAccount = PublicKey.findProgramAddressSync([Buffer.from("ip"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciData = await program.account.ciAccount.fetch(ciAccount);
            const ciTokenAccount = anchor.utils.token.associatedAddress({ mint: ciData.tokenMint, owner: ciAccount });
            const ownerTokenAccount = anchor.utils.token.associatedAddress({ mint: ciData.tokenMint, owner: wallet.publicKey! });
            await program.methods
                .withraw(params.ipid)
                .accounts({
                    ciAccount: ciAccount,
                    ipAccount: ipAccount,
                    signer: wallet.publicKey!,
                    ciTokenAccount: ciTokenAccount,
                    ownerTokenAccount: ownerTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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

    return async (params: {ipid: PublicKey})=>{
        if (!program) {
            toast.error("Program not initialized.");
            return;
        }
        try {
            const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), params.ipid.toBuffer()], PROGRAM_ID_POIP)[0]
            const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), wallet.publicKey!.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
            const ciData = await program.account.ciAccount.fetch(ciAccount);
            const ciTokenAccount = anchor.utils.token.associatedAddress({ mint: ciData.tokenMint, owner: ciAccount });
            const userTokenAccount = anchor.utils.token.associatedAddress({ mint: ciData.tokenMint, owner: wallet.publicKey! });

            await program.methods
                .bonus(params.ipid)
                .accounts({
                    ciAccount: ciAccount,
                    cpAccount: cpAccount,
                    signer: wallet.publicKey!,
                    ciTokenAccount: ciTokenAccount,
                    userTokenAccount: userTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                }).rpc()
            toast.success(`Tx Bonus Payment Success`)
        } catch (error: any) {
            toast.error(`Transaction Fail...`)
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
    return async (ipid: PublicKey, address: PublicKey)=>{
        if (!program) {
            toast.error("Program not initialized.");
            return null;
        }
        const ciAccount = PublicKey.findProgramAddressSync([Buffer.from("ci"), ipid.toBuffer()], PROGRAM_ID_POIP)[0]
        const cpAccount = PublicKey.findProgramAddressSync([Buffer.from("cp"), address.toBuffer(), ciAccount.toBuffer()], PROGRAM_ID_POIP)[0]
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

