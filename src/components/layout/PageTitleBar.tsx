// src/components/layout/PageTitleBar.tsx
import React from 'react';

interface PageTitleBarProps {
  title: string;
}

const PageTitleBar: React.FC<PageTitleBarProps> = ({ title }) => {
  return (
    <div className="bg-gray-100 py-4 border-b border-gray-200">
      <div className="container px-4">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>
    </div>
  );
};

export default PageTitleBar;