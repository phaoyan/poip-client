// src/app/products/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { IPAccount, IPMetadata } from '@/services/solana/types';
import { useGetIPAccount, useGetPayment } from '@/services/solana/solana-api';
import { usePurchaseAndDecrypt, useUpdateIntroFile } from '@/services/solana/poip-service';
import { PublicKey } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';

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
                setError(`获取 IP 账户或支付状态失败: ${err.message || err.toString()}`);
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
            await purchaseAndDecrypt({ ipid: new PublicKey(id) });
            setIsPurchasing(false);
            setHasPurchased(true);
        } catch (error) {
            console.error('购买失败:', error);
            alert(`购买失败: ${error}`);
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
                // **TODO:** Implement file upload logic using pinata and get the IPFS hash
                console.log("Uploading new cover file:", newCover);
                const formData = new FormData();
                formData.append('file', newCover);
                // Replace with your actual upload logic
                const uploadResponse = await fetch('/api/upload-ipfs', { // Example API route
                    method: 'POST',
                    body: formData,
                });
                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    coverIpfsHash = uploadData.ipfsHash; // Assuming your API returns ipfsHash
                    newMetadata.cover = coverIpfsHash;
                } else {
                    console.error("Failed to upload cover image");
                    alert("Failed to upload cover image");
                    setIsUpdatingIntro(false);
                    return;
                }
            }

            // Create a temporary file for the metadata
            const metadataBlob = new Blob([JSON.stringify(newMetadata)], { type: 'application/json' });
            const metadataFile = new File([metadataBlob], `${newFilename}.json`);

            await updateIntroFile(new PublicKey(id), metadataFile, newMetadata);
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
        return <div className="text-center mt-8">加载中...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500">错误: {error}</div>;
    }

    if (!ipAccount || !metadata) {
        return <div className="text-center mt-8">未找到该知识产权。</div>;
    }

    const isOwner = wallet.publicKey && ipAccount.owner.equals(wallet.publicKey);

    return (
        <div className="container mx-auto p-4">
            <Toaster />
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">{metadata.title}</h1>
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
                            {isPurchasing ? '购买中...' : hasPurchased ? '查看' : '购买并查看'}
                        </button>
                        {!wallet.connected && <span className="text-gray-500">请先连接钱包</span>}
                    </div>

                    {isOwner && (
                        <button
                            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={openEditModal}
                        >
                            修改信息
                        </button>
                    )}
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">修改信息</h2>
                        <div className="mb-4">
                            <label htmlFor="newTitle" className="block text-gray-700 text-sm font-bold mb-2">标题</label>
                            <input
                                type="text"
                                id="newTitle"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="新的标题"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newFilename" className="block text-gray-700 text-sm font-bold mb-2">文件名</label>
                            <input
                                type="text"
                                id="newFilename"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="新的文件名"
                                value={newFilename}
                                onChange={(e) => setNewFilename(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newCover" className="block text-gray-700 text-sm font-bold mb-2">封面</label>
                            <input
                                type="file"
                                id="newCover"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                onChange={handleCoverChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newDescription" className="block text-gray-700 text-sm font-bold mb-2">介绍信息</label>
                            <textarea
                                id="newDescription"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="新的介绍信息"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newLinks" className="block text-gray-700 text-sm font-bold mb-2">相关链接 (逗号分隔)</label>
                            <input
                                type="text"
                                id="newLinks"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="新的相关链接，用逗号分隔"
                                value={newLinksInput}
                                onChange={(e) => setNewLinksInput(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newSksUrl" className="block text-gray-700 text-sm font-bold mb-2">密钥服务 URL</label>
                            <input
                                type="text"
                                id="newSksUrl"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="新的密钥服务 URL"
                                value={newSksUrl}
                                onChange={(e) => setNewSksUrl(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                                onClick={closeEditModal}
                            >
                                取消
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={handleUpdateIntro}
                                disabled={isUpdatingIntro}
                            >
                                {isUpdatingIntro ? '更新中...' : '确定'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;