import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (Hidden on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="md:ml-64 transition-all duration-300">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden h-16 bg-white border-b flex items-center px-4 justify-between sticky top-0 z-10">
          <span className="font-bold text-primary">JBH Instructor</span>
          <button className="p-2 text-gray-600">
            <Menu size={24} />
          </button>
        </div>

        {/* Page Content Rendered Here */}
        <main className="p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;