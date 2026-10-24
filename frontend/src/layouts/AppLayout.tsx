import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(params.id || 'LL-9041');

  // Sync if URL param changes
  const activeId = params.id || selectedCaseId;

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B0F19] text-[#1A1A1A] dark:text-gray-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeCaseId={activeId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          activeCaseId={activeId}
          onSelectCase={id => setSelectedCaseId(id)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet context={{ activeCaseId: activeId }} />
        </main>
      </div>
    </div>
  );
};
