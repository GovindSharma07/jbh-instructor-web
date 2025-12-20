import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.fullName}!</p>
        </div>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid (Placeholder for now) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Upcoming Classes</p>
          <p className="text-3xl font-bold text-primary mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-3xl font-bold text-secondary mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Hours Taught</p>
          <p className="text-3xl font-bold text-green-600 mt-2">48h</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;