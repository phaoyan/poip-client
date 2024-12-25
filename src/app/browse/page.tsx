// src/app/browse/page.tsx
'use client'; // Mark this as a client component

import React, { useState, useEffect } from 'react';
import { IPAccount } from '@/services/solana/types'; // Import IP related type definitions
import ProductCard from '@/components/product/ProductCard'; // Import Product Card component
import { useGetAllIPAccounts } from '@/services/solana/solana-api';
import PageTitleBar from '@/components/layout/PageTitleBar'; // Import PageTitleBar component
import { Toaster } from 'react-hot-toast';
import Skeleton from '@/components/layout/Skeleton';


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
                // Get all IP Account addresses
                const allIpAccounts = await getAllIPAccounts();
                const fetchedIpAccounts = allIpAccounts.map(account => account.account);
                setIpAccounts(fetchedIpAccounts);
            } catch (err: any) {
                console.error("Failed to fetch IP Accounts:", err);
                setError(`Failed to fetch IP Accounts: ${err.message || err.toString()}`);
            } finally {
                setLoading(false);
            }
        }; fetchIPAccounts();
    }, []);

    if (loading) {
        return <Skeleton/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <PageTitleBar/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-5">
                {ipAccounts.map((ip) => (
                    <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                ))}
            </div>
            {ipAccounts.length === 0 && <p>No intellectual property available.</p>}

            <Toaster/>
        </div>
    );
};

export default BrowsePage;