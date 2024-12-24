// src/app/publish/page.tsx
'use client';

import React, { useState } from 'react';
import { useCreateIPAndEncrypt } from '@/services/solana/poip-service';
import { useTxPublish } from '@/services/solana/solana-api';
import PageTitleBar from '@/components/layout/PageTitleBar';
import { IPMetadata } from '@/services/solana/types';
import { Keypair } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';

const PublishPage: React.FC = () => {

    const [file, setFile] = useState<File | null>(null);
    const [price, setPrice] = useState<number | undefined>();
    const [goalCount, setGoalCount] = useState<number | undefined>();
    const [maxCount, setMaxCount] = useState<number | undefined>();
    const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<IPMetadata>({
        ipid: Keypair.generate().publicKey, //初始化随机生成一个IPID
        title: '',
        filename: '',
        cover: '',
        description: '',
        links: [''],
        sksUrl: ''
    });

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (
            !file || 
            !price || 
            !goalCount || 
            !maxCount || 
            !metadata.title || 
            !metadata.cover || 
            !metadata.description ||
            !metadata.sksUrl ||
            !metadata.filename) {
            alert('请填写所有必填字段。');
            return;
        }

        try {
            setIsEncrypting(true);
            await createIPAndEncrypt(file, metadata.ipid, metadata);
            setIsEncrypting(false);

            alert('IP 账户创建成功，文件已加密并上传！');

            // IP 产品创建成功后，调用 useTxPublish 发布
            setIsPublishing(true);
            await publishIP({
                ipid: metadata.ipid,
                price: price,
                goalcount: goalCount,
                maxcount: maxCount,
            });
            setIsPublishing(false);

            alert('IP 产品已成功发布！');

            // 重置表单，但保留生成的 IPID
            setFile(null);
            setPrice(undefined);
            setGoalCount(undefined);
            setMaxCount(undefined);
            setMetadata({
                ipid: metadata.ipid, // 保留生成的 IPID
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
            console.error('发布失败:', error);
            alert(`发布失败: ${error}`);
        }
    };

    return (
        <div>
            <PageTitleBar title="发布新的知识产权"/>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                <div className="mb-4">
                    <label htmlFor="ipid" className="block text-gray-700 text-sm font-bold mb-2">
                        IPID (知识产权标识符) - 自动生成
                    </label>
                    <input
                        type="text"
                        id="ipid"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed"
                        value={metadata.ipid.toBase58()}
                        readOnly // 禁止用户修改
                    />
                    <p className="text-sm text-gray-500 mt-1">此 IPID 为自动生成的 32 字节随机值，不可修改。</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
                        选择文件
                    </label>
                    <input
                        type="file"
                        id="file"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                        标题
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={metadata.title}
                        onChange={(e) => handleMetadataChange(e, 'title')}
                        placeholder="请输入作品标题"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                        文件名
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={metadata.filename}
                        onChange={(e) => handleMetadataChange(e, 'title')}
                        placeholder="请输入作品文件名（包括后缀）"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="cover" className="block text-gray-700 text-sm font-bold mb-2">
                        封面链接
                    </label>
                    <input
                        type="text"
                        id="cover"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={metadata.cover}
                        onChange={(e) => handleMetadataChange(e, 'cover')}
                        placeholder="请输入封面图片的 URL"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                        描述
                    </label>
                    <textarea
                        id="description"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={metadata.description}
                        onChange={(e) => handleMetadataChange(e, 'description')}
                        placeholder="请输入作品描述"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        相关链接
                    </label>
                    {metadata.links.map((link, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                                placeholder={`链接 ${index + 1}`}
                                value={link}
                                onChange={(e) => handleLinkChange(e, index)}
                            />
                            {metadata.links.length > 1 && (
                                <button
                                    type="button"
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    onClick={() => removeLink(index)}
                                >
                                    移除
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={addLink}
                    >
                        添加链接
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                        密钥服务地址
                    </label>
                    <input
                        id="description"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={metadata.sksUrl}
                        onChange={(e) => handleMetadataChange(e, 'sksUrl')}
                        placeholder="请输入提供密钥服务的服务器地址"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
                        价格
                    </label>
                    <input
                        type="number"
                        id="price"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="设置价格"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="goalCount" className="block text-gray-700 text-sm font-bold mb-2">
                        目标数量
                    </label>
                    <input
                        type="number"
                        id="goalCount"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={goalCount}
                        onChange={(e) => setGoalCount(Number(e.target.value))}
                        placeholder="设置目标数量"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="maxCount" className="block text-gray-700 text-sm font-bold mb-2">
                        最大数量
                    </label>
                    <input
                        type="number"
                        id="maxCount"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={maxCount}
                        onChange={(e) => setMaxCount(Number(e.target.value))}
                        placeholder="设置最大数量"
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={isEncrypting || isPublishing}
                    >
                        {isEncrypting ? '加密中...' : isPublishing ? '发布中...' : '发布'}
                    </button>
                </div>
            </form>


            <Toaster/>
        </div>
    );
};

export default PublishPage;