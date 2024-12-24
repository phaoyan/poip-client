import { PublicKey } from "@solana/web3.js"

export type IPID = string

export type  FiniteBuyout       = 1
export type  CompensativeBuyout = 2
export type  GoalmaxBuyout      = 3
export const FINITE_BUYOUT       = 1
export const COMPENSATIVE_BUYOUT = 2
export const GOALMAX_BUYOUT      = 3
export type IpContractType      = FiniteBuyout | CompensativeBuyout | GoalmaxBuyout // FB | CB | GM

export type  IPPrivate   = 1
export type  IPPublished = 2
export type  IPPublic    = 3
export const IP_PRIVATE   = 1
export const IP_PUBLISHED = 2
export const IP_PUBLIC    = 3
export type IPOwnership   = IPPrivate | IPPublished | IPPublic

export interface IPAccount {
    ipid: IPID
    link: string
    owner: PublicKey
    ownership: IPOwnership
}

export interface IPContract {
    ipid: IPID
    contractType: IpContractType
    price: number
    goalcount: number
    maxcount: number
}