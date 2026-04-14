import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { crmAPI } from '../api/api';
import AlertModal from '../components/AlertModal';
import {
  FaBuilding,
  FaChartLine,
  FaComments,
  FaCommentDots,
  FaBriefcase,
  FaDollarSign,
  FaSearch,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';

const CRM_STATUSES = [
  'lead',
  'contacted',
  'qualified',
  'proposal',
  'customer',
  'churned',
  'lost',
];

const formatCurrency = (cents) => {
  if (cents == null || cents === 0) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
};

const CrmPage = ({ user, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchHits, setSearchHits] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const searchTimer = useRef(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'error' });

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmAPI.list();
      setLeads(res.crm_leads || []);
    } catch (e) {
      setAlertModal({
        isOpen: true,
        title: 'Could not load CRM',
        message: e.message || 'Failed to load records',
        variant: 'error',
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadDetail = useCallback(async (id) => {
    if (!id) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const res = await crmAPI.get(id);
      setDetail(res);
      const c = res.crm_lead;
      setForm({
        name: c.name || '',
        contact_name: c.contact_name || '',
        email: c.email || '',
        phone: c.phone || '',
        website: c.website || '',
        status: c.status || 'lead',
        notes: c.notes || '',
        linked_user_id: c.linked_user_id ?? null,
      });
    } catch (e) {
      setAlertModal({
        isOpen: true,
        title: 'Could not load record',
        message: e.message || 'Failed to load',
        variant: 'error',
      });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCreating) {
      setDetail(null);
      setForm({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        status: 'lead',
        notes: '',
        linked_user_id: null,
      });
      return;
    }
    if (selectedId) loadDetail(selectedId);
    else {
      setDetail(null);
      setForm({});
    }
  }, [selectedId, isCreating, loadDetail]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = searchQ.trim();
    if (q.length < 2) {
      setSearchHits([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearchBusy(true);
      try {
        const res = await crmAPI.searchCompanyAccounts(q);
        setSearchHits(res.users || []);
      } catch {
        setSearchHits([]);
      } finally {
        setSearchBusy(false);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQ]);

  const openCreate = () => {
    setSelectedId(null);
    setIsCreating(true);
    setSearchQ('');
    setSearchHits([]);
  };

  const selectLead = (id) => {
    setIsCreating(false);
    setSelectedId(id);
    setSearchQ('');
    setSearchHits([]);
  };

  const saveRecord = async () => {
    const payload = {
      name: form.name?.trim(),
      contact_name: form.contact_name?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      website: form.website?.trim() || undefined,
      status: form.status || 'lead',
      notes: form.notes || undefined,
      linked_user_id: form.linked_user_id ?? null,
    };
    if (!payload.name) {
      setAlertModal({
        isOpen: true,
        title: 'Name required',
        message: 'Enter a company or account name.',
        variant: 'error',
      });
      return;
    }
    setSaving(true);
    try {
      if (isCreating) {
        const res = await crmAPI.create(payload);
        await loadList();
        setIsCreating(false);
        setSelectedId(res.crm_lead.id);
        setDetail(res);
      } else if (selectedId) {
        const res = await crmAPI.update(selectedId, payload);
        setDetail(res);
        await loadList();
      }
    } catch (e) {
      setAlertModal({
        isOpen: true,
        title: 'Save failed',
        message: e.message || 'Could not save',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async () => {
    if (!selectedId) return;
    if (!window.confirm('Delete this CRM record? This does not delete the linked platform account.')) return;
    try {
      await crmAPI.remove(selectedId);
      setSelectedId(null);
      setDetail(null);
      await loadList();
    } catch (e) {
      setAlertModal({
        isOpen: true,
        title: 'Delete failed',
        message: e.message || 'Could not delete',
        variant: 'error',
      });
    }
  };

  const c = detail?.crm_lead;
  const metrics = detail?.linked_metrics;
  const activity = detail?.activity;
  const recentJobs = detail?.recent_jobs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} onLogout={onLogout} activePage="crm" emailVariant="crm" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Company CRM</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track prospects and link a record to a real company account to see jobs, spend, and activity.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <FaPlus /> Add company
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Pipeline</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {loading ? (
                <p className="p-6 text-gray-500 text-sm">Loading…</p>
              ) : leads.length === 0 ? (
                <p className="p-6 text-gray-500 text-sm">No companies yet. Click &quot;Add company&quot; to start.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {leads.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => selectLead(row.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50/60 transition-colors ${
                          selectedId === row.id && !isCreating ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-700">{row.status}</span>
                          {row.linked_account && (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <FaLink className="text-emerald-600" /> Linked
                            </span>
                          )}
                          {row.email && <span>{row.email}</span>}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {!isCreating && !selectedId && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
                Select a company on the left or add a new one.
              </div>
            )}

            {(isCreating || selectedId) && (
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isCreating ? 'New company' : 'Edit record'}
                </h2>
                {detailLoading && !isCreating && (
                  <p className="text-sm text-gray-500 mb-4">Loading details…</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Company name *</span>
                    <input
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.name ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase">Contact</span>
                    <input
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.contact_name ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                    <select
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm capitalize"
                      value={form.status ?? 'lead'}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {CRM_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                    <input
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      type="email"
                      value={form.email ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase">Phone</span>
                    <input
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.phone ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Website</span>
                    <input
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.website ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Notes</span>
                    <textarea
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[88px]"
                      value={form.notes ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaBuilding className="text-amber-600" /> Link platform account
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Search by company login email, then select the account. Only company accounts can be linked. One CRM
                    record can link to one company user.
                  </p>
                  <div className="relative">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                      <FaSearch className="text-gray-400 shrink-0" />
                      <input
                        className="flex-1 text-sm outline-none"
                        placeholder="Type at least 2 characters of email…"
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                      />
                      {searchBusy && <span className="text-xs text-gray-400">Searching…</span>}
                    </div>
                    {searchHits.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
                        {searchHits.map((u) => (
                          <li key={u.id}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-gray-50"
                              onClick={() => {
                                setForm((f) => ({ ...f, linked_user_id: u.id }));
                                setSearchQ('');
                                setSearchHits([]);
                              }}
                            >
                              <span className="font-medium text-gray-900">{u.email}</span>
                              {u.company_name && <span className="text-gray-500"> — {u.company_name}</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {form.linked_user_id != null && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-emerald-700 font-medium">
                        Linked user id {form.linked_user_id}
                        {c?.linked_account?.email && ` (${c.linked_account.email})`}
                      </span>
                      <button
                        type="button"
                        className="text-red-600 hover:underline inline-flex items-center gap-1"
                        onClick={() => setForm((f) => ({ ...f, linked_user_id: null }))}
                      >
                        Unlink
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveRecord}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  {!isCreating && selectedId && (
                    <button
                      type="button"
                      onClick={removeRecord}
                      className="px-5 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium inline-flex items-center gap-2"
                    >
                      <FaTrash /> Delete record
                    </button>
                  )}
                  {isCreating && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setSelectedId(null);
                      }}
                      className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isCreating && selectedId && c?.linked_account && metrics && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FaChartLine className="text-blue-600" /> Account metrics
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Same aggregates as the company dashboard for{' '}
                    {c.linked_account.company_profile_id ? (
                      <Link
                        to={`/companies/${c.linked_account.company_profile_id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {c.linked_account.company_name || c.linked_account.email}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-800">{c.linked_account.company_name || c.linked_account.email}</span>
                    )}
                    .
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                        <FaDollarSign /> Total spent (finished jobs)
                      </div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(metrics.total_spent_cents)}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <div className="text-xs text-gray-500 font-medium">Jobs posted</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{metrics.jobs_posted ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <div className="text-xs text-gray-500 font-medium">Completed</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{metrics.jobs_completed ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <div className="text-xs text-gray-500 font-medium">Open</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{metrics.jobs_open ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <div className="text-xs text-gray-500 font-medium">Active</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{metrics.jobs_active ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <div className="text-xs text-gray-500 font-medium">Technicians hired</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{metrics.unique_technicians_hired ?? 0}</div>
                    </div>
                  </div>
                </div>

                {activity && (
                  <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaComments className="text-indigo-600" /> Activity
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaCommentDots className="text-orange-500" />
                        <span>Feedback submissions: {activity.feedback_submissions_count}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaComments className="text-indigo-500" />
                        <span>Conversations: {activity.conversations_count}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaComments className="text-teal-600" />
                        <span>Messages: {activity.messages_count}</span>
                      </div>
                    </div>
                  </div>
                )}

                {recentJobs.length > 0 && (
                  <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                      <FaBriefcase className="text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Recent jobs</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Created</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recentJobs.map((j) => (
                            <tr key={j.id}>
                              <td className="px-4 py-2 font-medium text-gray-900">{j.title}</td>
                              <td className="px-4 py-2 capitalize text-gray-600">{j.status}</td>
                              <td className="px-4 py-2 text-gray-500">
                                {j.created_at ? new Date(j.created_at).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-2">
                                <Link to={`/jobs/${j.id}`} className="text-blue-600 hover:underline">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((p) => ({ ...p, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
};

export default CrmPage;
