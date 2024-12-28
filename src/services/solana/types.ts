import { BN } from "bn.js"
import { PublicKey } from "@solana/web3.js"


export const IP_PRIVATE   = 1
export const IP_PUBLISHED = 2
export const IP_PUBLIC    = 3

export interface CIAccount {
    ipid: PublicKey
    tokenMint: PublicKey
    price: number
    goalcount: number
    maxcount: number
    currcount: number
    withdrawalCount: number
}

export interface CPAccount {
    ipid: PublicKey
    owner: PublicKey
    withdrawal: number
}

export interface IPMetadata {
    ipid:        PublicKey
    title:       string
    filename:    string
    cover:       string // 封面
    description: string
    links:       string[]
    sksUrl:      string // 提供密钥服务的URL
    secretKey?:  string
    iv?:         string
}