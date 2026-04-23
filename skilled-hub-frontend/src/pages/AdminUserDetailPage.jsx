import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { adminUsersAPI } from '../api/api';
import AlertModal from '../components/AlertModal';

const PERIODS = [
  { id: '24h', label: '24h' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: 'all', label: 'All time' },
];

function fmtMoney(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);
}

export default function AdminUserDetailPage({ user, onLogout }) {
  const { userId } = useParams();
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error',
  });

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await adminUsersAPI.get(userId, period);
      setData(res);
    } catch (e) {
      setData(null);
      setAlertModal({
        isOpen: true,
        title: 'Could not load user',
        message: e.message || 'Failed',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    load();
  }, [load]);

  const u = data?.user;
  const profile = u?.profile;
  const isCompany = data?.role_key === 'company' || u?.role === 'company';
  const isTech = data?.role_key === 'technician' || u?.role === 'technician';

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} onLogout={onLogout} activePage="users" emailVariant="crm" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Users
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{u?.email || 'User'}</h1>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {u?.role}
              {profile?.company_name && ` · ${profile.company_name}`}
              {profile?.trade_type && ` · ${profile.trade_type}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-500 uppercase mr-1">Metrics window</span>
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  period === p.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading analytics…</p>}

        {!loading && data && (
          <div className="space-y-8">
            <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">User ID</dt>
                  <dd className="font-medium text-gray-900">{u?.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Joined</dt>
                  <dd className="font-medium text-gray-900">
                    {u?.created_at ? new Date(u.created_at).toLocaleString() : '—'}
                  </dd>
                </div>
                {profile?.location && (
                  <div>
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium text-gray-900">{profile.location}</dd>
                  </div>
                )}
                {profile?.stripe_customer_id != null && (
                  <div>
                    <dt className="text-gray-500">Stripe customer</dt>
                    <dd className="font-mono text-xs text-gray-800 break-all">{profile.stripe_customer_id}</dd>
                  </div>
                )}
                {profile?.stripe_account_id != null && (
                  <div>
                    <dt className="text-gray-500">Stripe Connect</dt>
                    <dd className="font-mono text-xs text-gray-800 break-all">{profile.stripe_account_id}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Logins</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <Stat label="In period" value={data.logins?.total_in_period ?? '—'} />
                <Stat label="All time" value={data.logins?.total_all_time ?? '—'} />
                <Stat
                  label="Last login"
                  value={
                    data.logins?.last_login_at
                      ? new Date(data.logins.last_login_at).toLocaleString()
                      : 'Never'
                  }
                />
              </div>
              {data.logins?.recent?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent (20)</h3>
                  <ul className="text-sm text-gray-700 space-y-1 max-h-48 overflow-y-auto">
                    {data.logins.recent.map((row, i) => (
                      <li key={i}>{row.at ? new Date(row.at).toLocaleString() : '—'}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <Stat label="Job threads (period)" value={data.messages?.job_threads_sent_in_period ?? 0} />
                <Stat label="Job threads (all time)" value={data.messages?.job_threads_sent_all_time ?? 0} />
                <Stat label="Feedback (period)" value={data.messages?.feedback_messages_sent_in_period ?? 0} />
                <Stat label="Feedback (all time)" value={data.messages?.feedback_messages_sent_all_time ?? 0} />
              </div>
            </section>

            {isCompany && data.jobs && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs (company)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <Stat label="Total jobs" value={data.jobs.total ?? 0} />
                  <Stat label="Posted in window" value={data.jobs.in_period ?? 0} />
                </div>
                {data.jobs.by_status && Object.keys(data.jobs.by_status).length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">By status</h3>
                    <ul className="flex flex-wrap gap-2">
                      {Object.entries(data.jobs.by_status).map(([k, v]) => (
                        <li key={k} className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {k}: <strong>{v}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.jobs.recent?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent jobs</h3>
                    <ul className="divide-y divide-gray-100">
                      {data.jobs.recent.map((j) => (
                        <li key={j.id} className="py-2 flex justify-between gap-4 text-sm">
                          <span className="font-medium text-gray-900">{j.title}</span>
                          <span className="text-gray-500 capitalize">{j.status}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {isTech && data.jobs && data.applications && (
              <>
                <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs & applications</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <Stat label="Accepted jobs (total)" value={data.jobs.accepted_total ?? 0} />
                    <Stat label="Accepted (window)" value={data.jobs.accepted_in_period ?? 0} />
                    <Stat label="Applications (total)" value={data.applications.total ?? 0} />
                    <Stat label="Applications (window)" value={data.applications.in_period ?? 0} />
                  </div>
                  {data.applications.by_status && (
                    <ul className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(data.applications.by_status).map(([k, v]) => (
                        <li key={k} className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">
                          {k}: <strong>{v}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                  {data.jobs.recent?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent accepted jobs</h3>
                      <ul className="divide-y divide-gray-100">
                        {data.jobs.recent.map((j) => (
                          <li key={j.id} className="py-2 flex justify-between gap-4 text-sm">
                            <span className="font-medium text-gray-900">{j.title}</span>
                            <span className="text-gray-500 capitalize">{j.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              </>
            )}

            {data.payments && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isCompany ? 'Payments (company)' : 'Payments (technician)'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {isCompany && (
                    <>
                      <Stat label="Spent (released, all time)" value={fmtMoney(data.payments.spent_released_cents_all_time)} />
                      <Stat label="Spent (released, window)" value={fmtMoney(data.payments.spent_released_cents_in_period)} />
                    </>
                  )}
                  {isTech && (
                    <>
                      <Stat label="Earned (released, all time)" value={fmtMoney(data.payments.earned_released_cents_all_time)} />
                      <Stat label="Earned (released, window)" value={fmtMoney(data.payments.earned_released_cents_in_period)} />
                    </>
                  )}
                </div>
                {data.payments.recent?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-2 pr-4">Job</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Released</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.payments.recent.map((p) => (
                          <tr key={p.id} className="border-b border-gray-50">
                            <td className="py-2 pr-4">{p.job_title || `#${p.job_id}`}</td>
                            <td className="py-2 pr-4">{fmtMoney(p.amount_cents)}</td>
                            <td className="py-2 pr-4 capitalize">{p.status}</td>
                            <td className="py-2 text-gray-600">
                              {p.released_at ? new Date(p.released_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {data.ratings && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ratings & reviews</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <Stat label="Received (total)" value={data.ratings.received_total ?? 0} />
                  <Stat label="Received (window)" value={data.ratings.received_in_period ?? 0} />
                  <Stat label="Given (total)" value={data.ratings.given_total ?? 0} />
                  <Stat label="Given (window)" value={data.ratings.given_in_period ?? 0} />
                </div>
                {data.ratings.avg_score_received != null && (
                  <p className="text-sm text-gray-700 mb-4">
                    Average score received: <strong>{data.ratings.avg_score_received}</strong> / 5
                  </p>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent received</h3>
                    <ul className="space-y-3 text-sm">
                      {(data.ratings.recent_received || []).map((r) => (
                        <li key={r.id} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-gray-900">{r.job_title || 'Job'}</span>
                            <span className="text-amber-700">{r.score != null ? `${r.score}★` : '—'}</span>
                          </div>
                          {r.comment && <p className="text-gray-600 mt-1">{r.comment}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent given</h3>
                    <ul className="space-y-3 text-sm">
                      {(data.ratings.recent_given || []).map((r) => (
                        <li key={r.id} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-gray-900">{r.job_title || 'Job'}</span>
                            <span className="text-amber-700">{r.score != null ? `${r.score}★` : '—'}</span>
                          </div>
                          {r.comment && <p className="text-gray-600 mt-1">{r.comment}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
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

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase">{label}</div>
      <div className="text-lg font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
