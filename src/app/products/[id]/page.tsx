// src/app/products/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { CIAccount, CPAccount, IPAccount, IPMetadata } from '@/services/solana/types';
import { useAnchorProgram, useGetIPAccount, useGetPayment, useTxWithdraw, useTxBonus, useGetContractAccount, _network } from '@/services/solana/solana-api';
import { usePurchaseAndDecrypt, useUpdateIntroFile } from '@/services/solana/poip-service';
import { Connection, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { uploadFile, extractCid, deleteFile } from '@/services/solana/pinata';
import Skeleton from '@/components/layout/Skeleton';
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const ProductDetailPage: React.FC = () => {
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : undefined;

    const wallet             = useWallet();
    const program            = useAnchorProgram();

    const getIPAccount       = useGetIPAccount();
    const getCIAccount       = useGetContractAccount();
    const getCPAccount       = useGetPayment();
    const getPayment         = useGetPayment();
    const purchaseAndDecrypt = usePurchaseAndDecrypt();
    const updateIntroFile    = useUpdateIntroFile();
    const txWithdraw         = useTxWithdraw();
    const txBonus            = useTxBonus();

    const [ipAccount, setIpAccount] = useState<IPAccount | null>(null);
    const [ciAccount, setCiAccount] = useState<CIAccount | null>(null);
    const [cpAccount, setCpAccount] = useState<CPAccount | null>(null);
    const [metadata, setMetadata] = useState<IPMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newFilename, setNewFilename] = useState('');
    const [newCover, setNewCover] = useState<File | null>(null);
    const [newDescription, setNewDescription] = useState('');
    const [newLinksInput, setNewLinksInput] = useState('');
    const [newSksUrl, setNewSksUrl] = useState('');
    const [isUpdatingIntro, setIsUpdatingIntro] = useState(false);
    const [isUploadingNewCover, setIsUploadingNewCover] = useState(false);
    const [pinataGateway, setPinataGateway] = useState<string>('');
    const [pinataJWT, setPinataJWT] = useState<string>('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isBonusLoading, setIsBonusLoading] = useState(false);
    const [tokenDecimals, setTokenDecimals] = useState(0)

    const [withdrawPopoverVisible, setWithdrawPopoverVisible] = useState(false);
    const [bonusPopoverVisible, setBonusPopoverVisible] = useState(false);
    const [withdrawnProfit, setWithdrawnProfit] = useState<number>(0);
    const [totalWithdrawable, setTotalWithdrawable] = useState<number>(0);
    const [claimedBonus, setClaimedBonus] = useState<number>(0);
    const [totalBonus, setTotalBonus] = useState<number>(0);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!id || !wallet || !program) return;

            setLoading(true);
            setError(null);
            setHasPurchased(false);

            try {
                const fetchedIpAccount = await getIPAccount(new PublicKey(id));
                setIpAccount(fetchedIpAccount);
                let fetchedCIAccount: CIAccount | null = null;
                if (fetchedIpAccount) {
                    const fetchedCPAccount = await getPayment(fetchedIpAccount.ipid);
                    setCpAccount(fetchedCPAccount);
                    fetchedCIAccount = await getCIAccount(fetchedIpAccount.ipid);
                    setCiAccount(fetchedCIAccount);
                    fetchedCIAccount && await fetchTokenDecimals(fetchedCIAccount.tokenMint.toBase58())
                }

                if (fetchedIpAccount?.intro) {
                    const metadataResponse = await fetch(fetchedIpAccount.intro);
                    if (metadataResponse.ok) {
                        const metadataData = await metadataResponse.json();
                        setMetadata(metadataData);
                        setNewTitle(metadataData.title);
                        setNewFilename(metadataData.filename);
                        // We don't pre-fill the cover file input
                        setNewDescription(metadataData.description);
                        setNewLinksInput(metadataData.links.join(','));
                        setNewSksUrl(metadataData.sksUrl);
                    } else {
                        console.error("Failed to fetch IP Metadata:", metadataResponse);
                        setError("Failed to fetch IP Metadata.");
                    }
                }

                if (wallet.publicKey) {
                    const paymentRecord = await getPayment(new PublicKey(id));
                    setHasPurchased(!!paymentRecord);
                }
            } catch (err: any) {
                console.error("Failed to fetch IP Account or Payment Status:", err);
                setError(`Failed to fetch IP Account or Payment Status: ${err.message || err.toString()}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id, wallet.publicKey, program]);

    useEffect(() => {
        if (ciAccount) {
            const totalAmount = ciAccount.currcount * ciAccount.price;
            const withdrawnAmount = (ciAccount.withdrawalCount || 0) * ciAccount.price;
            setTotalWithdrawable(totalAmount / (10 ** tokenDecimals))
            setWithdrawnProfit(withdrawnAmount / (10 ** tokenDecimals))
        }
    }, [ciAccount, tokenDecimals]);

    useEffect(() => {
        if (ciAccount && cpAccount) {
            const potentialBonus = ciAccount.currcount > 0 ? Math.max(0, ((ciAccount.currcount - ciAccount.goalcount) * ciAccount.price) / ciAccount.currcount) : 0;
            const alreadyClaimedBonus = cpAccount.withdrawal || 0;
            setTotalBonus(potentialBonus / (10 ** tokenDecimals));
            setClaimedBonus(alreadyClaimedBonus / (10 ** tokenDecimals));
        }
    }, [ciAccount, cpAccount, tokenDecimals]);

    const handlePurchase = async () => {
        if (!ipAccount || !id) return;
        try {
            setIsPurchasing(true);
            const purchased = await purchaseAndDecrypt({ ipid: new PublicKey(id) });
            setIsPurchasing(false);
            setHasPurchased(!!purchased);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert(`Purchase failed: ${error}`);
        }
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        // Reset form values when closing
        if (metadata) {
            setNewTitle(metadata.title);
            setNewFilename(metadata.filename);
            setNewCover(null);
            setNewDescription(metadata.description);
            setNewLinksInput(metadata.links.join(','));
            setNewSksUrl(metadata.sksUrl);
        }
    };

    const handleUpdateIntro = async () => {
        if (!ipAccount || !id) return;
        if (!pinataJWT || !pinataGateway) {
            toast.error('Please fill in Pinata Gateway and Pinata JWT');
            return;
        }

        setIsUpdatingIntro(true);
        try {
            const linksArray = newLinksInput.split(',').map(link => link.trim()).filter(link => link !== '');
            const newMetadata: IPMetadata = {
                ipid: ipAccount.ipid, // Keep the original IPID
                title: newTitle,
                filename: newFilename,
                cover: metadata?.cover || '', // Keep the old cover if no new one is selected
                description: newDescription,
                links: linksArray,
                sksUrl: newSksUrl,
            };

            // If a new cover file is selected, upload it first
            let coverIpfsHash = metadata?.cover || '';
            if (newCover) {
                setIsUploadingNewCover(true);
                try {
                    const response = await uploadFile(newCover, pinataJWT, pinataGateway);
                    coverIpfsHash = `https://${pinataGateway}/ipfs/${response.IpfsHash}`;
                    newMetadata.cover = coverIpfsHash;
                } catch (uploadError) {
                    console.error("Failed to upload cover image", uploadError);
                    setIsUpdatingIntro(false);
                    setIsUploadingNewCover(false);
                    return;
                } finally {
                    setIsUploadingNewCover(false);
                    if(!!metadata) {
                        const oriCid = extractCid(metadata.cover)
                        oriCid && await deleteFile(oriCid, pinataJWT, pinataGateway)
                    }
                }
            }

            // Create a temporary file for the metadata
            const metadataBlob = new Blob([JSON.stringify(newMetadata)], { type: 'application/json' });
            const metadataFile = new File([metadataBlob], `${newFilename}.json`);

            await updateIntroFile(new PublicKey(id), metadataFile, newMetadata, pinataJWT, pinataGateway);
            setMetadata(newMetadata); // Update local state
            closeEditModal();
        } catch (error) {
            console.error('Failed to update introduction:', error);
            alert(`Failed to update introduction: ${error}`);
        } finally {
            setIsUpdatingIntro(false);
        }
    };

    const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setNewCover(event.target.files[0]);
        } else {
            setNewCover(null);
        }
    };

    const handleWithdraw = async () => {
        if (!id) return;
        setIsWithdrawing(true);
        try {
            await txWithdraw({ ipid: new PublicKey(id) });
            toast.success('Withdrawal successful!');
        } catch (error) {
            console.error('Withdrawal failed:', error);
            toast.error('Withdrawal failed.');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleBonus = async () => {
        if (!id) return;
        setIsBonusLoading(true);
        try {
            await txBonus({ ipid: new PublicKey(id) });
            toast.success('Bonus received!');
        } catch (error) {
            console.error('Bonus payment failed:', error);
            toast.error('Bonus payment failed.');
        } finally {
            setIsBonusLoading(false);
        }
    };


    const fetchTokenDecimals = useCallback(async (mintAddress: string) => {
        try {
            const connection = new Connection(_network, 'processed');
            const mintInfo = await getMint(
                connection,
                new PublicKey(mintAddress),
                undefined,
                TOKEN_PROGRAM_ID
            );
            setTokenDecimals(mintInfo.decimals);
            return mintInfo.decimals;
        } catch (error) {
            console.error('Error fetching token decimals:', error);
            setTokenDecimals(0);
            toast.error('Failed to fetch token decimals. Please check the Token Mint address.');
            return null;
        }
    }, []);

    if (loading) {
        return <Skeleton/>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
    }

    if (!ipAccount || !metadata || !ciAccount) {
        return <div className="text-center mt-8">Intellectual Property not found.</div>;
    }

    const isOwner = wallet.publicKey && ipAccount.owner.equals(wallet.publicKey);

    return (
        <div>
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10">
                <div className="p-6">
                    {metadata.cover && (<img src={metadata.cover} alt={`${metadata.title} Cover`} className="w-full h-auto rounded mb-3" />)}
                    <h1 className="text-3xl font-extrabold mb-4">{metadata.title}</h1>
                    <p className="text-gray-700 mb-6">{metadata.description}</p>
                    <p className="text-sm text-gray-500">Filename: {metadata.filename}</p>
                    <p className="text-sm text-gray-500">SKS URL: {metadata.sksUrl}</p>
                    <p className="text-sm text-gray-500">IPID: {ipAccount.ipid.toBase58()}</p>

                    <div className="flex items-center justify-between mt-8">
                        {!wallet.connected && <span className="text-gray-500">Please connect your wallet</span>}
                        <div className="flex">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePurchase}
                                disabled={isPurchasing || !wallet.connected}
                            >
                                {isPurchasing ? 'Purchasing...' : hasPurchased ? 'Download' : 'Purchase and Download'}
                            </button>
                            {hasPurchased && (
                                <div className="relative">
                                    <button
                                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                                        onClick={handleBonus}
                                        disabled={isBonusLoading || !wallet.connected}
                                        onMouseEnter={() => setBonusPopoverVisible(true)}
                                        onMouseLeave={() => setBonusPopoverVisible(false)}
                                    >
                                        {isBonusLoading ? 'Loading...' : 'Bonus'}
                                    </button>
                                    {bonusPopoverVisible && (
                                        <div className="absolute left-0 -top-28 mt-2 w-64 bg-white border rounded shadow-md z-10 p-2">
                                            <p className="text-sm text-gray-700">Total: {totalBonus.toString()}</p>
                                            <p className="text-sm text-gray-700">Available: {claimedBonus.toString()}</p>
                                            <p className="text-sm text-gray-700">Token : {ciAccount.tokenMint.toBase58().slice(0,8)}...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex">
                            {isOwner && (
                                <div className="relative">
                                    <button
                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleWithdraw}
                                        disabled={isWithdrawing}
                                        onMouseEnter={() => setWithdrawPopoverVisible(true)}
                                        onMouseLeave={() => setWithdrawPopoverVisible(false)}
                                    >
                                        {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                                    </button>
                                    {withdrawPopoverVisible && (
                                        <div className="absolute left-0 -top-28 mt-2 w-64 bg-white border rounded shadow-md z-10 p-2">
                                            <p className="text-sm text-gray-700">Total: {totalWithdrawable}</p>
                                            <p className="text-sm text-gray-700">Withdrawn: {withdrawnProfit}</p>
                                            <p className="text-sm text-gray-700">Token Mint: {ciAccount.tokenMint.toBase58().slice(0,8)}...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {isOwner && (
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    onClick={openEditModal}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Edit Information</h2>
                        <div className="mb-4">
                            <label htmlFor="newTitle" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                            <input
                                type="text"
                                id="newTitle"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="New Title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newFilename" className="block text-gray-700 text-sm font-bold mb-2">Filename</label>
                            <input
                                type="text"
                                id="newFilename"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="New Filename"
                                value={newFilename}
                                onChange={(e) => setNewFilename(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newCover" className="block text-gray-700 text-sm font-bold mb-2">Cover</label>
                            <div className="flex items-center">
                                <input
                                    type="file"
                                    id="newCover"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    onChange={handleCoverChange}
                                    accept="image/*"
                                    style={{ display: 'none' }} // Hide the default file input
                                />
                                <button
                                    type="button"
                                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isUploadingNewCover ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => document.getElementById('newCover')?.click()}
                                    disabled={isUploadingNewCover}
                                >
                                    {isUploadingNewCover ? 'Uploading...' : 'Select Cover'}
                                </button>
                                {newCover && (
                                    <div className="ml-4">
                                        <img
                                            src={newCover ? URL.createObjectURL(newCover) : metadata?.cover}
                                            alt="New cover preview"
                                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                                        />
                                    </div>
                                )}
                                {metadata?.cover && !newCover && (
                                    <div className="ml-4">
                                        <img src={metadata.cover} alt="Current Cover" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Click the button to select and upload a new cover image.</p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newDescription" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                            <textarea
                                id="newDescription"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="New Description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newLinks" className="block text-gray-700 text-sm font-bold mb-2">Related Links (comma separated)</label>
                            <input
                                type="text"
                                id="newLinks"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="New related links, separated by commas"
                                value={newLinksInput}
                                onChange={(e) => setNewLinksInput(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newSksUrl" className="block text-gray-700 text-sm font-bold mb-2">Secret Key Service URL</label>
                            <input
                                type="text"
                                id="newSksUrl"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="New Secret Key Service URL"
                                value={newSksUrl}
                                onChange={(e) => setNewSksUrl(e.target.value)}
                            />
                        </div>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-1/2">
                                <label htmlFor="pinataGateway" className="block text-gray-700 font-bold mb-2">
                                    Pinata Gateway
                                </label>
                                <input
                                    type="text"
                                    id="pinataGateway"
                                    className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                    value={pinataGateway}
                                    onChange={(e) => setPinataGateway(e.target.value)}
                                    placeholder="Pinata IPFS Gateway"
                                    required
                                />
                            </div>

                            <div className="w-1/2">
                                <label htmlFor="pinataJWT" className="block text-gray-700 font-bold mb-2">
                                    Pinata JWT
                                </label>
                                <input
                                    type="text"
                                    id="pinataJWT"
                                    className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                    value={pinataJWT}
                                    onChange={(e) => setPinataJWT(e.target.value)}
                                    placeholder="Pinata JWT"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                                onClick={closeEditModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={handleUpdateIntro}
                                disabled={isUpdatingIntro || isUploadingNewCover}
                            >
                                {isUpdatingIntro ? 'Updating...' : isUploadingNewCover ? 'Uploading...' : 'Confirm'}
                            </button>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
};

export default ProductDetailPage;