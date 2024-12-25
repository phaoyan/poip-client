// src/components/product/ProductCard.tsx
import React, { useState, useEffect } from 'react';
import { IPAccount, IPMetadata } from '@/services/solana/types';
import Link from 'next/link';
import { useGetContractAccount } from '@/services/solana/solana-api';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface ProductCardProps {
  ipAccount: IPAccount;
}

const ProductCard: React.FC<ProductCardProps> = ({ ipAccount }) => {
  const [metadata, setMetadata] = useState<IPMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const isPublic = ipAccount.ownership === 3; // Assuming IPOwnership 3 represents public
  const getContractAccount = useGetContractAccount();
  const [ciAccount, setCiAccount] = useState<any | null>(null);
  const [loadingCiAccount, setLoadingCiAccount] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      setMetadataError(null);
      try {
        const response = await fetch(ipAccount.intro);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData: IPMetadata = await response.json();
        setMetadata(jsonData);
      } catch (e: any) {
        console.error("Failed to fetch metadata:", e);
        setMetadataError("Failed to load product description.");
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [ipAccount.intro]);

  useEffect(() => {
    const fetchCiAccount = async () => {
      setLoadingCiAccount(true);
      try {
        const contractData = await getContractAccount(ipAccount.ipid);
        setCiAccount(contractData);
      } catch (error) {
        console.error("Failed to fetch contract account:", error);
        setCiAccount(null);
      } finally {
        setLoadingCiAccount(false);
      }
    };

    fetchCiAccount();
  }, [ipAccount.ipid]);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      {loadingMetadata && <p className="text-gray-500">Loading product description...</p>}
      {metadataError && <p className="text-red-500">{metadataError}</p>}
      {metadata && (
        <>
          {metadata.cover && (<img src={metadata.cover} alt={`${metadata.title} Cover`} className="w-full h-auto rounded mb-3" />)}
          {metadata.title && <p className="text-gray-600 mb-2 text-2xl font-extrabold">{metadata.title}</p>}
          <p className="text-gray-500 mb-3">{metadata.description || 'No description available'}</p>
        </>
      )}

      <div>
        {loadingCiAccount ? (
          <p className="text-gray-500">Loading sales information...</p>
        ) : ciAccount ? (
          <div className="mb-3">
            <p className="text-sm text-gray-700">{
              (ciAccount.price.toNumber() / LAMPORTS_PER_SOL).toFixed(8)} SOL
              ({" "}{ciAccount.goalcount.toNumber()}{" "}~{" "}{ciAccount.maxcount.toNumber() === 0 ? 'Unlimited' : ciAccount.maxcount.toNumber()}{" "})</p>
          </div>
        ) : (
          <p className="text-gray-700 mb-3">No sales information available</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div>
          {isPublic ? (
            <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              Public
            </span>
          ) : (
            <span className="text-gray-700">Private</span>
          )}
        </div>
        <Link href={`/products/${ipAccount.ipid}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;