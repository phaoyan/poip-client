// src/components/layout/PageTitleBar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from '../wallet/WalletButton';

interface PageTitleBarProps {}

const PageTitleBar: React.FC<PageTitleBarProps> = () => {
  const pathname = usePathname();

  return (
    <div className={`bg-white shadow-md py-4 border-b border-gray-100`}>
      <div className="px-6 flex justify-between items-center">
        <nav className="flex space-x-6">
          <img src="/logo.png" alt="Poip - Solana" className="h-8 w-auto mr-4 ml-2" style={{scale: "240%"}} />

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
        </nav>
        <div>
          <WalletButton />
        </div>
      </div>
    </div>
  );
};

export default PageTitleBar;