// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ProductCard from '@/components/product/ProductCard';
import { IPAccount } from '@/services/solana/types';
import { useGetAllIPAccounts } from '@/services/solana/solana-api';
import PageTitleBar from '@/components/layout/PageTitleBar';
import { Toaster } from 'react-hot-toast';

const DashboardPage: React.FC = () => {
    const { publicKey } = useWallet();
    const [publishedIPs, setPublishedIPs] = useState<IPAccount[]>([]);
    const [purchasedIPs, setPurchasedIPs] = useState<IPAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAllIPAccounts = useGetAllIPAccounts()

    useEffect(() => {
        const fetchUserIPData = async () => {
            if (!publicKey) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 获取用户发布的所有 IP
                const allIpAccounts = await getAllIPAccounts()
                const userPublishedIPs = allIpAccounts
                    .map(account => account.account)
                    .filter(data=>data.owner.equals(publicKey));
                setPublishedIPs(userPublishedIPs);

                // **TODO:**  实现获取用户购买的 IP 的逻辑
                // 这可能需要一个单独的链上账户来记录购买信息，
                // 或者通过扫描链上交易来确定用户购买过的 IP。
                // 由于当前合约中没有明确的购买记录，这里先留空。
                setPurchasedIPs([]);

            } catch (err: any) {
                console.error("Failed to fetch user IP data:", err);
                setError(`获取用户 IP 数据失败: ${err.message || err.toString()}`);
            } finally {
                setLoading(false);
            }
        }; fetchUserIPData();
    }, [publicKey]);

    if (loading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>错误: {error}</div>;
    }

    if (!publicKey) {
        return <div>请先连接钱包。</div>;
    }

    return (
        <div>
            <PageTitleBar title="我的控制台"/>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">我发布的知识产权</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {publishedIPs.length > 0 ? (
                        publishedIPs.map((ip) => (
                            <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                        ))
                    ) : (
                        <p>您尚未发布任何知识产权。</p>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">我购买的知识产权</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {purchasedIPs.length > 0 ? (
                        purchasedIPs.map((ip) => (
                            <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                        ))
                    ) : (
                        <p>您尚未购买任何知识产权。</p>
                    )}
                </div>
            </section>

            <Toaster/>
        </div>
    );
};

export default DashboardPage;