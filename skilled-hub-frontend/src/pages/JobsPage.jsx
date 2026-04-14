import React from 'react';
import JobList from '../components/JobList';
import AppHeader from '../components/AppHeader';

const JobsPage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} onLogout={onLogout} activePage="jobs" emailVariant="welcome" />

      <main className="py-8">
        <JobList />
      </main>
    </div>
  );
};

export default JobsPage; 