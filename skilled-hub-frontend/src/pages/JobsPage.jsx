import React from 'react';
import { Link } from 'react-router-dom';
import JobList from '../components/JobList';

const JobsPage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/jobs" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              SkilledHub
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.email}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {user?.role}
                </span>
              </div>
              <button 
                onClick={onLogout} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <JobList />
      </main>
    </div>
  );
};

export default JobsPage; 