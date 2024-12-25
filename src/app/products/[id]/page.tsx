// src/app/products/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { IPAccount, IPMetadata } from '@/services/solana/types';
import { useGetIPAccount, useGetPayment } from '@/services/solana/solana-api';
import { usePurchaseAndDecrypt, useUpdateIntroFile } from '@/services/solana/poip-service';
import { PublicKey } from '@solana/web3.js';
import toast, { Toaster } from 'react-hot-toast';
import { uploadFile, extractCid, deleteFile } from '@/services/solana/pinata';
import PageTitleBar from '@/components/layout/PageTitleBar';
import Skeleton from '@/components/layout/Skeleton';



const ProductDetailPage: React.FC = () => {
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : undefined;

    const wallet             = useWallet();
    const getIPAccount       = useGetIPAccount();
    const getPayment         = useGetPayment();
    const purchaseAndDecrypt = usePurchaseAndDecrypt();
    const updateIntroFile    = useUpdateIntroFile();

    const [ipAccount, setIpAccount] = useState<IPAccount | null>(null);
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

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);
            setHasPurchased(false);

            try {
                const fetchedIpAccount = await getIPAccount(new PublicKey(id));
                setIpAccount(fetchedIpAccount);

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
    }, [id, wallet.publicKey]);

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

    if (loading) {
        return <Skeleton/>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
    }

    if (!ipAccount || !metadata) {
        return <div className="text-center mt-8">Intellectual Property not found.</div>;
    }

    const isOwner = wallet.publicKey && ipAccount.owner.equals(wallet.publicKey);

    return (
        <div>
            <PageTitleBar/>
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10">
                <div className="p-6">
                    {metadata.cover && (<img src={metadata.cover} alt={`${metadata.title} Cover`} className="w-full h-auto rounded mb-3" />)}
                    <h1 className="text-3xl font-extrabold mb-4">{metadata.title}</h1>
                    <p className="text-gray-700 mb-6">{metadata.description}</p>
                    <p className="text-sm text-gray-500">Filename: {metadata.filename}</p>
                    <p className="text-sm text-gray-500">SKS URL: {metadata.sksUrl}</p>
                    <p className="text-sm text-gray-500">IPID: {ipAccount.ipid.toBase58()}</p>

                    <div className="flex items-center justify-between mt-8">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handlePurchase}
                            disabled={isPurchasing || !wallet.connected}
                        >
                            {isPurchasing ? 'Purchasing...' : hasPurchased ? 'Download' : 'Purchase and Download'}
                        </button>
                        {!wallet.connected && <span className="text-gray-500">Please connect your wallet</span>}

                        {isOwner && (
                            <button
                                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={openEditModal}
                            >
                                Edit
                            </button>
                        )}
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

            <Toaster />
        </div>
    );
};

export default ProductDetailPage;