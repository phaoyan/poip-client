// src/app/browse/page.tsx
'use client'; // 标记这是一个客户端组件

import React, { useState, useEffect } from 'react';
import { IPAccount } from '@/services/solana/types'; // 导入 IP 相关的类型定义
import ProductCard from '@/components/product/ProductCard'; // 导入产品卡片组件
import { useGetAllIPAccounts } from '@/services/solana/solana-api';
import PageTitleBar from '@/components/layout/PageTitleBar'; // 导入 PageTitleBar 组件
import { Toaster } from 'react-hot-toast';

const BrowsePage: React.FC = () => {
    const [ipAccounts, setIpAccounts] = useState<IPAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const getAllIPAccounts = useGetAllIPAccounts()

    useEffect(() => {
        const fetchIPAccounts = async () => {
            setLoading(true);
            setError(null);

            try {
                // 获取所有 IP Account 的地址
                const allIpAccounts = await getAllIPAccounts();
                const fetchedIpAccounts = allIpAccounts.map(account => account.account);
                setIpAccounts(fetchedIpAccounts);
            } catch (err: any) {
                console.error("Failed to fetch IP Accounts:", err);
                setError(`获取 IP 账户失败: ${err.message || err.toString()}`);
            } finally {
                setLoading(false);
            }
        }; fetchIPAccounts();
    }, []);

    if (loading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>错误: {error}</div>;
    }

    return (
        <div>
            <PageTitleBar title="浏览知识产权" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-5">
                {ipAccounts.map((ip) => (
                    <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                ))}
            </div>
            {ipAccounts.length === 0 && <p>暂无知识产权。</p>}

            <Toaster/>
        </div>
    );
};

export default BrowsePage;