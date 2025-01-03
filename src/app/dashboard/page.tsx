// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ProductCard from '@/components/product/ProductCard';
import { useAnchorProgram, useGetAllIPAccounts, useGetAllPaymentAccounts, useGetIPAccount } from '@/services/solana/solana-api';
import Skeleton from '@/components/layout/Skeleton';

const DashboardPage: React.FC = () => {
    const { publicKey } = useWallet();
    const program = useAnchorProgram();

    const [publishedIPs, setPublishedIPs] = useState<any[]>([]);
    const [purchasedIPs, setPurchasedIPs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getIPAccount     = useGetIPAccount()
    const getAllIPAccounts = useGetAllIPAccounts()
    const getAllCPAccounts = useGetAllPaymentAccounts()

    useEffect(() => {
        const fetchUserIPData = async () => {
            if (!publicKey || !program) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Get all IP published by the user
                const allIpAccounts = await getAllIPAccounts()
                const userPublishedIPs = allIpAccounts
                    .map(account => account.account)
                    .filter(data=>data.owner.equals(publicKey));
                setPublishedIPs(userPublishedIPs);

                const allCpAccounts = await getAllCPAccounts()
                const userPayments = allCpAccounts
                    .map(account => account.account)
                    .filter(data=>data.owner.equals(publicKey));
                const allPurchasedIPAccounts =
                    ((await Promise.all(userPayments.map(async (cpAccount)=> await getIPAccount(cpAccount.ipid))))
                    .filter(data=>!!data))
                setPurchasedIPs(allPurchasedIPAccounts);

            } catch (err: any) {
                console.error("Failed to fetch user IP data:", err);
                setError(`Failed to fetch user IP data: ${err.message || err.toString()}`);
            } finally {
                setLoading(false);
            }
        }; fetchUserIPData();
    }, [publicKey, program]);

    if (loading) {
        return <Skeleton/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!publicKey) {
        return <Skeleton/>;
    }

    return (
        <div>
            <div className="flex">
                <section className="w-1/2 ml-5 mb-8 mt-4 pl-2">
                    <h2 className="text-4xl font-semibold mb-2">Purchased IPs</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {purchasedIPs.length > 0 ? (
                            purchasedIPs.map((ip) => (
                                <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                            ))
                        ) : (
                            <div className=' ml-10 mt-10'>
                                <span className='text-4xl text-gray-200'> No Data  </span>    
                            </div>
                        )}
                    </div>
                </section>

                <section className="w-1/2 ml-5 mb-8 mt-4 pr-2">
                    <h2 className="text-4xl font-semibold mb-2">Published IPs</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {publishedIPs.length > 0 ? (
                            publishedIPs.map((ip) => (
                                <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                            ))) : (
                                <div className=' ml-10 mt-10'>
                                    <span className='text-4xl text-gray-200'> No Data  </span>    
                                </div>
                            )}
                    </div>
                </section>
            </div>

        </div>
    );
};

export default DashboardPage;