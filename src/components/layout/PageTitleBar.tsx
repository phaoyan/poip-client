// src/components/layout/PageTitleBar.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from '../wallet/WalletButton';
import { useNetworkConfiguration } from '@/services/solana/solana-api'; // Import the hook
import toast from 'react-hot-toast';

interface PageTitleBarProps {}

const PageTitleBar: React.FC<PageTitleBarProps> = () => {
  const pathname = usePathname();
  const { network, updateNetwork } = useNetworkConfiguration(); // Get network config
  const [newNetwork, setNewNetwork] = useState<string | null>(network);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleNetworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNetwork(e.target.value);
  };

  const handleSaveNetwork = () => {
    if (newNetwork) {
      updateNetwork(newNetwork);
      toast.success(`Network updated to: ${newNetwork}`);
      setIsEditing(false);
    } else {
      toast.error("Network cannot be empty.");
    }
  };

  const handleEditClick = () => {
    setNewNetwork(network);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className={`bg-white shadow-md py-4 border-b border-gray-100`}>
      <div className="px-6 flex justify-between items-center">
        <nav className="flex space-x-6 items-center">
          <img src="/logo.png" alt="Poip - Solana" className="h-8 w-auto mr-4 ml-2" style={{ scale: "240%" }} />

          <Link
            href="/dashboard"
            className={`text-2xl font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200 ${
              pathname === '/dashboard'
                ? 'text-indigo-600 font-semibold'
                : ''
            }`}>
            Dashboard
          </Link>

          <Link
            href="/browse"
            className={`text-2xl font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200 ${
              pathname === '/browse'
                ? 'text-indigo-600 font-semibold'
                : ''
            }`}>
            Browse
          </Link>

          <Link
            href="/publish"
            className={`text-2xl font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200 ${
              pathname === '/publish'
                ? 'text-indigo-600 font-semibold'
                : ''
            }`}>
            Publish
          </Link>

          <span className={`text-2xl font-medium text-gray-500 ${
            pathname?.startsWith('/products/')
            ? 'text-indigo-600 font-semibold'
            : ''
          }`}>
            Product
          </span>
          <a 
           href="https://github.com/phaoyan/poip-client" target="_blank" rel="noopener noreferrer"
           className={`text-2xl font-medium text-gray-500 ${
            pathname?.startsWith('/products/')
            ? 'text-indigo-600 font-semibold'
            : ''
          }`}>
            Github
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newNetwork || ''}
                onChange={handleNetworkChange}
                className="border rounded p-1 text-sm"
                placeholder="Enter Network URL"
              />
              <button onClick={handleSaveNetwork} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-sm">
                Save
              </button>
              <button onClick={handleCancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-1 px-2 rounded text-sm">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={handleEditClick} className="text-gray-500 hover:text-indigo-600 transition-colors duration-200 text-sm">
              Network: {network}
            </button>
          )}
          <WalletButton />
        </div>
      </div>
    </div>
  );
};

export default PageTitleBar;