
// src/app/publish/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCreateIPAndEncrypt } from '@/services/solana/poip-service';
import { useTxPublish } from '@/services/solana/solana-api';
import { IPMetadata } from '@/services/solana/types';
import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { uploadFile } from '@/services/solana/pinata';
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { _network } from '@/services/solana/solana-api';

const COMMON_TOKENS = [
    { name: 'wSOL', address: 'So11111111111111111111111111111111111111112' },
    { name: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'},
    { name: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'},
];

const MANUAL_INPUT_VALUE = 'MANUAL_INPUT';

const PublishPage: React.FC = () => {

    const [file, setFile] = useState<File | null>(null);
    const [priceInput, setPriceInput] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [goalCount, setGoalCount] = useState<number>(0);
    const [maxCount, setMaxCount] = useState<number>(0);
    const [tokenMint, setTokenMint] = useState<string>('');
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
    const [pinataGateway, setPinataGateway] = useState<string>('');
    const [pinataJWT, setPinataJWT] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ ipid: string; key: string; iv: string } | null>(null);
    const [metadata, setMetadata] = useState<IPMetadata>({
        ipid: Keypair.generate().publicKey,
        title: '',
        filename: '',
        cover: '',
        description: '',
        links: [''],
        sksUrl: ''
    });
    const [showManualTokenInput, setShowManualTokenInput] = useState(false);

    const createIPAndEncrypt = useCreateIPAndEncrypt();
    const publishIP = useTxPublish();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof IPMetadata) => {
        setMetadata(prev => ({
            ...prev,
            [key]: e.target.value,
        }));
    };

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newLinks = [...metadata.links];
        newLinks[index] = e.target.value;
        setMetadata(prev => ({
            ...prev,
            links: newLinks,
        }));
    };

    const addLink = () => {
        setMetadata(prev => ({
            ...prev,
            links: [...prev.links, ''],
        }));
    };

    const removeLink = (index: number) => {
        const newLinks = metadata.links.filter((_, i) => i !== index);
        setMetadata(prev => ({
            ...prev,
            links: newLinks,
        }));
    };

    const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if(!pinataJWT || !pinataGateway) {
            toast.error('Please fill in Pinata Gateway and Pinata JWT first.');
            return;
        }

        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            await uploadCoverImage(file);
        }
    }

    const uploadCoverImage = async (file: File) => {
        if (!file) {
            toast.error('Please select a cover image first.');
            return;
        }

        setIsUploadingCover(true);
        try {
            if(!file) {
                setMetadata(prev => ({
                    ...prev,
                    cover: "No Cover Image",
                }));
            } else {
                const response = await uploadFile(file, pinataJWT!, pinataGateway!);
                const imageUrl = `https://${pinataGateway}/ipfs/${response.IpfsHash}`;
                setMetadata(prev => ({
                    ...prev,
                    cover: imageUrl,
                }));
            }
        } catch (error) {
            toast.error('Cover upload failed:');
        } finally {
            setIsUploadingCover(false);
            const coverInput = document.getElementById('cover-upload') as HTMLInputElement;
            if (coverInput) {
                coverInput.value = '';
            }
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
            setTokenDecimals(null);
            toast.error('Failed to fetch token decimals. Please check the Token Mint address.');
            return null;
        }
    }, []);

    const handleTokenMintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        if (selectedValue === MANUAL_INPUT_VALUE) {
            setShowManualTokenInput(true);
            setTokenMint('');
            setTokenDecimals(null);
            setPriceInput('');
            setPrice(0);
        } else {
            setShowManualTokenInput(false);
            setTokenMint(selectedValue);
            if (selectedValue) {
                fetchTokenDecimals(selectedValue);
            } else {
                setTokenDecimals(null);
                setPriceInput('');
                setPrice(0);
            }
        }
    };

    const handleManualTokenMintInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMint = e.target.value;
        setTokenMint(newMint);
        if (newMint) {
            fetchTokenDecimals(newMint);
        } else {
            setTokenDecimals(null);
            setPriceInput('');
            setPrice(0);
        }
    };

    const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        setPriceInput(inputVal);
        if (tokenDecimals !== null && inputVal) {
            const numPrice = parseFloat(inputVal);
            if (!isNaN(numPrice)) {
                setPrice(numPrice * Math.pow(10, tokenDecimals));
            } else {
                setPrice(0);
            }
        } else {
            setPrice(0);
        }
    };

    useEffect(() => {
        if (!tokenMint) {
            setPriceInput('');
            setPrice(0);
            setTokenDecimals(null);
        }
    }, [tokenMint]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if(!file) {
            toast.error('Please upload IP File.');
            return;
        }
        if (
            !file ||
            !price ||
            !goalCount ||
            !maxCount ||
            !tokenMint ||
            tokenDecimals === null ||
            !metadata.title ||
            !metadata.cover ||
            !metadata.description ||
            !metadata.sksUrl ||
            !metadata.filename ||
            !pinataGateway ||
            !pinataJWT) {
            toast.error('Please fill in all required fields and ensure Token Mint is valid.');
            return;
        }

        try {
            setIsEncrypting(true);
            const encryptionResult = await createIPAndEncrypt(file, metadata.ipid, metadata, pinataJWT, pinataGateway);
            setIsEncrypting(false);

            if (encryptionResult) {
                setModalData({
                    ipid: metadata.ipid.toBase58(),
                    key: encryptionResult.keyBase64,
                    iv: encryptionResult.ivBase64,
                });
                setIsModalOpen(true);
            }

            toast.success('IP account created successfully, file encrypted and uploaded!');

            setIsPublishing(true);
            await publishIP({
                ipid: metadata.ipid,
                price: price,
                goalcount: goalCount,
                maxcount: maxCount,
                tokenMint: new PublicKey(tokenMint),
            });
            setIsPublishing(false);

            toast.success('IP product published successfully!');

            setFile(null);
            setPriceInput('');
            setPrice(0);
            setGoalCount(0);
            setMaxCount(0);
            setTokenMint('');
            setTokenDecimals(null);
            setShowManualTokenInput(false);
            setMetadata({
                ipid: metadata.ipid,
                title: '',
                filename: '',
                cover: '',
                description: '',
                links: [''],
                sksUrl: ''
            });
        } catch (error) {
            setIsEncrypting(false);
            setIsPublishing(false);
            console.error('Publish failed:', error);
            toast.error(`Publish failed`);
        }
    };

    const isPriceInputDisabled = !tokenMint;

    return (
        <div>
            <div>
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-2 mt-2">

                    <div className="mb-4 flex items-center">
                        <span className="mr-5 font-extrabold text-2xl">Publish</span>
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={handleFileChange}
                            required
                        />
                        <button
                            type="button"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => document.getElementById('file')?.click()}
                        >
                            <span className='p-2'>{file?.name || "Upload File"}</span>
                        </button>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="sksUrl" className="block text-gray-700 font-bold mb-2">
                            Secret Key Service URL
                        </label>
                        <input
                            type="text"
                            id="sksUrl"
                            className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            value={metadata.sksUrl}
                            onChange={(e) => handleMetadataChange(e, 'sksUrl')}
                            placeholder="Enter the secret key service URL"
                            required
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

                    <div className="mb-4 flex items-center">
                        <label
                            htmlFor="title"
                            className="block text-gray-700 font-bold mb-2 mr-4">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            value={metadata.title}
                            onChange={(e) => handleMetadataChange(e, 'title')}
                            placeholder="title"
                            required
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <label
                            htmlFor="filename"
                            className="block text-gray-700 font-bold mb-2 mr-4">
                            Filename
                        </label>
                        <input
                            type="text"
                            id="filename"
                            className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            value={metadata.filename}
                            onChange={(e) => handleMetadataChange(e, 'filename')}
                            placeholder="filename (including extension)"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            value={metadata.description}
                            onChange={(e) => handleMetadataChange(e, 'description')}
                            placeholder="Enter a description of the work"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="cover" className="block text-gray-700 font-bold mb-2">
                            Cover
                        </label>
                        <div className="flex items-center">
                            <input
                                type="file"
                                id="cover-upload"
                                className="hidden"
                                onChange={handleCoverChange}
                                accept="image/*"
                            />
                            <button
                                type="button"
                                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ${isUploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => document.getElementById('cover-upload')?.click()}
                                disabled={isUploadingCover}
                            >
                                {isUploadingCover ? 'Uploading...' : 'Select Cover'}
                            </button>
                            {metadata.cover && (
                                <div className="ml-4">
                                    <img src={metadata.cover} alt="Cover Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">
                            Related Links
                        </label>
                        {metadata.links.map((link, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    type="text"
                                    className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none mr-2"
                                    placeholder={`Link ${index + 1}`}
                                    value={link}
                                    onChange={(e) => handleLinkChange(e, index)}
                                />
                                {metadata.links.length > 1 && (
                                    <button
                                        type="button"
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => removeLink(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                            onClick={addLink}
                        >
                            Add Link
                        </button>
                    </div>

                    <div className="mb-4 flex space-x-4">
                        <div className="w-1/4">
                            <label htmlFor="price" className="block text-gray-700 font-bold mb-2">
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                value={priceInput}
                                onChange={handlePriceInputChange}
                                placeholder="Set Price"
                                required
                            />
                        </div>
                        <div className="w-1/4">
                            <label htmlFor="tokenMint" className="block text-gray-700 font-bold mb-2">
                                Token Mint
                            </label>
                            <select
                                id="tokenMint"
                                className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                value={showManualTokenInput ? MANUAL_INPUT_VALUE : tokenMint}
                                onChange={handleTokenMintChange}
                                required
                            >
                                {COMMON_TOKENS.map((token) => (
                                    <option key={token.address} value={token.address}>{token.name}</option>
                                ))}
                                <option value={MANUAL_INPUT_VALUE}>Others</option>
                            </select>
                            {showManualTokenInput && (
                                <input
                                    type="text"
                                    className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none mt-2"
                                    placeholder="Token Address"
                                    value={tokenMint}
                                    onChange={handleManualTokenMintInputChange}
                                />
                            )}
                        </div>
                        <div className="w-1/4">
                            <label htmlFor="goalCount" className="block text-gray-700 font-bold mb-2">
                                Goal Count
                            </label>
                            <input
                                type="number"
                                id="goalCount"
                                className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                value={goalCount}
                                onChange={(e) => setGoalCount(Number(e.target.value))}
                                placeholder="Goal Count"
                                required
                            />
                        </div>
                        <div className="w-1/4">
                            <label htmlFor="maxCount" className="block text-gray-700 font-bold mb-2">
                                Max Count
                            </label>
                            <input
                                type="number"
                                id="maxCount"
                                className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                value={maxCount}
                                onChange={(e) => setMaxCount(Number(e.target.value))}
                                placeholder="Max Count"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline text-xl"
                            type="submit"
                            disabled={isEncrypting || isPublishing || isUploadingCover || isPriceInputDisabled}
                        >
                            {isEncrypting ? 'Encrypting...' : isPublishing ? 'Publishing...' : isUploadingCover ? 'Uploading...' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={modalData}/>

        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; data: { ipid: string; key: string; iv: string } | null }> = ({
    isOpen,
    onClose,
    data,
}) => {
    if (!isOpen || !data) {
        return null;
    }

    const handleCopyToClipboard = () => {
        const textToCopy = `IPID: ${data.ipid}\nEncryption Key: ${data.key}\nIV: ${data.iv}`;
        navigator.clipboard.writeText(textToCopy);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="relative p-8 bg-white w-full max-w-xl m-auto flex-col flex rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Remember Your IPID / Key / IV</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="mb-4">
                    <span className="text-xl font-bold">It won't be shown again.</span>
                </div>
                <div>
                    <p>IPID: </p>
                    <p className='text-gray-500 text-sm'>{data.ipid}</p>
                    <p>Encryption Key: </p>
                    <p className='text-gray-500 text-sm'>{data.key}</p>
                    <p>IV: </p>
                    <p className='text-gray-500 text-sm'>{data.iv}</p>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleCopyToClipboard}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Copy All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublishPage;