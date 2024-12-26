// src/app/browse/page.tsx
'use client'; // Mark this as a client component

import React, { useState, useEffect } from 'react';
import { IPAccount } from '@/services/solana/types'; // Import IP related type definitions
import ProductCard from '@/components/product/ProductCard'; // Import Product Card component
import { useAnchorProgram, useGetAllIPAccounts } from '@/services/solana/solana-api';
import Skeleton from '@/components/layout/Skeleton';


const BrowsePage: React.FC = () => {
    const program = useAnchorProgram();
    
    const [ipAccounts, setIpAccounts] = useState<IPAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const getAllIPAccounts = useGetAllIPAccounts()
    

    useEffect(() => {
        const fetchIPAccounts = async () => {
            if (!program) {
                setLoading(false);
                return;
            }

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
    }, [program]);

    if (loading) {
        return <Skeleton/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-5">
                {ipAccounts.map((ip) => (
                    <ProductCard key={ip.ipid.toBase58()} ipAccount={ip} />
                ))}
            </div>
            {ipAccounts.length === 0 && (
                <div className=' ml-10 mt-10'>
                    <span className='text-4xl text-gray-200'> No IP Available ...  </span>    
                </div>
            )}

        </div>
    );
};

export default BrowsePage;