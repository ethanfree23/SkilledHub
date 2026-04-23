import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { adminUsersAPI } from '../api/api';
import AlertModal from '../components/AlertModal';
import { FaBuilding, FaSearch, FaUserPlus, FaWrench } from 'react-icons/fa';

const ROLE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'company', label: 'Companies' },
  { id: 'technician', label: 'Technicians' },
];

export default function AdminUsersPage({ user, onLogout }) {
  const [roleTab, setRoleTab] = useState('all');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const searchTimer = useRef(null);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success',
  });

  const [createRole, setCreateRole] = useState('company');
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    company_name: '',
    industry: '',
    location: '',
    bio: '',
    trade_type: '',
    experience_years: '',
    availability: '',
  });

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedQ(searchQ.trim()), 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQ]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUsersAPI.list({
        q: debouncedQ || undefined,
        role: roleTab === 'all' ? 'all' : roleTab,
      });
      setList(res.users || []);
    } catch (e) {
      setAlertModal({
        isOpen: true,
        title: 'Could not load users',
        message: e.message || 'Failed',
        variant: 'error',
      });
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, roleTab]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const email = createForm.email?.trim();
    if (!email) {
      setAlertModal({
        isOpen: true,
        title: 'Email required',
        message: 'Enter an email for the new account.',
        variant: 'error',
      });
      return;
    }
    setCreating(true);
    try {
      const payload =
        createRole === 'company'
          ? {
              role: 'company',
              email,
              company_name: createForm.company_name?.trim() || undefined,
              industry: createForm.industry?.trim() || undefined,
              location: createForm.location?.trim() || undefined,
              bio: createForm.bio?.trim() || undefined,
            }
          : {
              role: 'technician',
              email,
              trade_type: createForm.trade_type?.trim() || undefined,
              location: createForm.location?.trim() || undefined,
              experience_years:
                createForm.experience_years === '' ? undefined : parseInt(createForm.experience_years, 10),
              availability: createForm.availability?.trim() || undefined,
              bio: createForm.bio?.trim() || undefined,
            };
      await adminUsersAPI.create(payload);
      setCreateForm({
        email: '',
        company_name: '',
        industry: '',
        location: '',
        bio: '',
        trade_type: '',
        experience_years: '',
        availability: '',
      });
      await loadUsers();
      setAlertModal({
        isOpen: true,
        title: 'User created',
        message:
          'They will receive an email with a link to set their password. Temporary login password is derived from their email.',
        variant: 'success',
      });
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'Create failed',
        message: err.message || 'Could not create user',
        variant: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} onLogout={onLogout} activePage="users" emailVariant="crm" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse technicians and companies, open analytics for any account, or provision a new user.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow p-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <FaUserPlus className="text-emerald-600 shrink-0" aria-hidden />
            <h2 className="text-lg font-semibold text-gray-900">Create user</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCreateRole('company')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                createRole === 'company'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <FaBuilding className="inline mr-1" /> Company
            </button>
            <button
              type="button"
              onClick={() => setCreateRole('technician')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                createRole === 'technician'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <FaWrench className="inline mr-1" /> Technician
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Email *</span>
              <input
                type="email"
                required
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="login@company.com"
              />
            </label>
            {createRole === 'company' ? (
              <>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">Company name</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.company_name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, company_name: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase">Industry</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.industry}
                    onChange={(e) => setCreateForm((f) => ({ ...f, industry: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase">Location</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.location}
                    onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase">Trade</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.trade_type}
                    onChange={(e) => setCreateForm((f) => ({ ...f, trade_type: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase">Years experience</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.experience_years}
                    onChange={(e) => setCreateForm((f) => ({ ...f, experience_years: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase">Availability</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.availability}
                    onChange={(e) => setCreateForm((f) => ({ ...f, availability: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase">Location</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.location}
                    onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </label>
              </>
            )}
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Bio</span>
              <textarea
                rows={2}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={createForm.bio}
                onChange={(e) => setCreateForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create & email'}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {ROLE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRoleTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                roleTab === t.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="search"
            placeholder="Search by email…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                      No users match.
                    </td>
                  </tr>
                ) : (
                  list.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{row.email}</div>
                        <div className="text-xs text-gray-500">#{row.id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-gray-700">{row.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.label}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/users/${row.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal((m) => ({ ...m, isOpen: false }))}
      />
    </div>
  );
}
