// src/app/browse/page.tsx
'use client'; // Mark this as a client component

import React from 'react';
import PageTitleBar from '@/components/layout/PageTitleBar'; // Import PageTitleBar component
import { Toaster } from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';


const Skeleton: React.FC = () => {

    const { publicKey } = useWallet();

    return (
        <div>
            <PageTitleBar/>
            <div className=' ml-10 mt-10'>
                <span className='text-4xl text-gray-200'> {
                    publicKey ? "Loading Data ..." : " Please Connect Your Wallet ... "} </span>    
            </div>

            <Toaster/>
        </div>
    );
};

export default Skeleton;