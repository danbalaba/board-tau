'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

const AdminLayoutClient: React.FC<AdminLayoutClientProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check if sidebar should be collapsed on initial load
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState) {
      setIsCollapsed(savedSidebarState === 'true');
    }
  }, []);

  useEffect(() => {
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <AdminSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <AdminTopbar />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayoutClient;
