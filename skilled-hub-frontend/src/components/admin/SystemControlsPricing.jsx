import React, { useState, useEffect, useCallback } from 'react';
import { adminMembershipTierConfigsAPI } from '../../api/api';

const emptyNewTier = () => ({
  slug: '',
  display_name: '',
  monthly_fee_dollars: '0',
  commission_percent: '10',
  early_access_delay_hours: '0',
  sort_order: '0',
  stripe_price_id: '',
});

function tierToFormRow(t, audience) {
  return {
    id: t.id,
    slug: t.slug,
    display_name: t.display_name || '',
    monthly_fee_dollars: (t.monthly_fee_cents / 100).toFixed(2),
    commission_percent: String(t.commission_percent),
    early_access_delay_hours:
      audience === 'technician' ? String(t.early_access_delay_hours ?? 0) : '',
    sort_order: String(t.sort_order ?? 0),
    stripe_price_id: t.stripe_price_id || '',
  };
}

export default function SystemControlsPricing() {
  const [audience, setAudience] = useState('technician');
  const [systemSubTab, setSystemSubTab] = useState('pricing');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTier, setNewTier] = useState(emptyNewTier);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [provisionBusyId, setProvisionBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminMembershipTierConfigsAPI.list(audience);
      const list = res?.membership_tier_configs || [];
      setRows(list.map((t) => tierToFormRow(t, audience)));
    } catch (e) {
      setError(e.message || 'Failed to load tiers');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      const originals = await adminMembershipTierConfigsAPI.list(audience);
      const byId = Object.fromEntries((originals.membership_tier_configs || []).map((t) => [t.id, t]));

      for (const r of rows) {
        const orig = byId[r.id];
        if (!orig) continue;
        const monthly_fee_cents = Math.round(parseFloat(r.monthly_fee_dollars) * 100) || 0;
        const commission_percent = parseFloat(r.commission_percent);
        const sort_order = parseInt(r.sort_order, 10) || 0;
        const stripe_price_id = r.stripe_price_id.trim() || null;
        const early =
          audience === 'technician'
            ? parseInt(r.early_access_delay_hours, 10)
            : null;

        const payload = {
          display_name: r.display_name.trim() || null,
          monthly_fee_cents,
          commission_percent,
          sort_order,
          stripe_price_id,
        };
        if (audience === 'technician') {
          payload.early_access_delay_hours = Number.isNaN(early) ? 0 : early;
        }

        const unchanged =
          (orig.display_name || '') === (r.display_name.trim() || '') &&
          orig.monthly_fee_cents === monthly_fee_cents &&
          Math.abs(orig.commission_percent - commission_percent) < 0.0001 &&
          orig.sort_order === sort_order &&
          (orig.stripe_price_id || '') === (stripe_price_id || '') &&
          (audience !== 'technician' ||
            (orig.early_access_delay_hours ?? 0) === (Number.isNaN(early) ? 0 : early));

        if (!unchanged) {
          await adminMembershipTierConfigsAPI.update(r.id, payload);
        }
      }
      await load();
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const slug = newTier.slug.trim().toLowerCase();
      if (!slug) throw new Error('Slug is required');

      const monthly_fee_cents = Math.round(parseFloat(newTier.monthly_fee_dollars) * 100) || 0;
      const payload = {
        audience,
        slug,
        display_name: newTier.display_name.trim() || null,
        monthly_fee_cents,
        commission_percent: parseFloat(newTier.commission_percent) || 0,
        sort_order: parseInt(newTier.sort_order, 10) || 0,
        stripe_price_id: newTier.stripe_price_id.trim() || null,
      };
      if (audience === 'technician') {
        payload.early_access_delay_hours = parseInt(newTier.early_access_delay_hours, 10);
        if (Number.isNaN(payload.early_access_delay_hours)) payload.early_access_delay_hours = 0;
      }

      await adminMembershipTierConfigsAPI.create(payload);
      setAddOpen(false);
      setNewTier(emptyNewTier());
      await load();
    } catch (err) {
      setError(err.message || 'Could not create tier');
    } finally {
      setCreating(false);
    }
  };

  const handleProvisionStripe = async (rowId) => {
    setProvisionBusyId(rowId);
    setError(null);
    try {
      const res = await adminMembershipTierConfigsAPI.provisionStripe(rowId);
      if (res?.membership_tier_config) {
        setRows((prev) =>
          prev.map((r) => (r.id === rowId ? tierToFormRow(res.membership_tier_config, audience) : r))
        );
      }
    } catch (e) {
      setError(e.message || 'Failed to create Stripe price');
    } finally {
      setProvisionBusyId(null);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    setError(null);
    try {
      await adminMembershipTierConfigsAPI.remove(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      await load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200" role="tablist" aria-label="System controls sections">
        <button
          type="button"
          role="tab"
          aria-selected={systemSubTab === 'pricing'}
          onClick={() => setSystemSubTab('pricing')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            systemSubTab === 'pricing'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Pricing
        </button>
      </div>

      {systemSubTab === 'pricing' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2 max-w-3xl">
            <p>
              Configure membership tiers, monthly fees, and commission. New or edited paid tiers do not charge
              subscription checkout until a monthly recurring <span className="font-medium text-gray-800">Stripe</span>{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">price_…</code> exists and is stored here (or a matching
              legacy <code className="text-xs bg-gray-100 px-1 rounded">STRIPE_*_PRICE_ID</code> environment variable
              is set and the row has no ID).
            </p>
            <p>
              Paste a price ID from the Stripe Dashboard, or use <span className="font-medium text-gray-800">Create in Stripe</span>{' '}
              to have TechFlash create a product and monthly price via the server (requires a Stripe secret key in the
              API). That action uses the <em>last saved</em> monthly fee—click <span className="font-medium">Save changes</span> first
              if you changed the amount.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Audience</span>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
              <button
                type="button"
                onClick={() => setAudience('technician')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  audience === 'technician' ? 'bg-white shadow text-blue-700' : 'text-gray-600'
                }`}
              >
                Tech
              </button>
              <button
                type="button"
                onClick={() => setAudience('company')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  audience === 'company' ? 'bg-white shadow text-blue-700' : 'text-gray-600'
                }`}
              >
                Company
              </button>
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="ml-auto px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Add tier
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Slug</th>
                      <th className="px-3 py-2 font-medium">Display name</th>
                      <th className="px-3 py-2 font-medium">Monthly fee ($)</th>
                      <th className="px-3 py-2 font-medium">Commission %</th>
                      {audience === 'technician' && (
                        <th className="px-3 py-2 font-medium">Early access (hrs)</th>
                      )}
                      <th className="px-3 py-2 font-medium">Sort</th>
                      <th className="px-3 py-2 font-medium min-w-[200px]">Stripe subscription (price_…)</th>
                      <th className="px-3 py-2 font-medium w-24" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-mono text-xs text-gray-800">{r.slug}</td>
                        <td className="px-3 py-2">
                          <input
                            value={r.display_name}
                            onChange={(e) => updateRow(r.id, 'display_name', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={r.monthly_fee_dollars}
                            onChange={(e) => updateRow(r.id, 'monthly_fee_dollars', e.target.value)}
                            className="w-24 border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={r.commission_percent}
                            onChange={(e) => updateRow(r.id, 'commission_percent', e.target.value)}
                            className="w-24 border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        {audience === 'technician' && (
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={r.early_access_delay_hours}
                              onChange={(e) => updateRow(r.id, 'early_access_delay_hours', e.target.value)}
                              className="w-20 border rounded px-2 py-1 text-sm"
                            />
                          </td>
                        )}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="1"
                            value={r.sort_order}
                            onChange={(e) => updateRow(r.id, 'sort_order', e.target.value)}
                            className="w-16 border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1.5 min-w-[180px] max-w-xs">
                            <input
                              value={r.stripe_price_id}
                              onChange={(e) => updateRow(r.id, 'stripe_price_id', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-xs font-mono"
                              placeholder="price_…"
                              autoComplete="off"
                              title="Recurring price ID. Clear and create a new one in Stripe if the monthly fee changed."
                            />
                            <button
                              type="button"
                              className="w-full px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-45 disabled:cursor-not-allowed"
                              disabled={
                                saving ||
                                loading ||
                                provisionBusyId !== null ||
                                (parseFloat(r.monthly_fee_dollars) || 0) <= 0 ||
                                (r.stripe_price_id && String(r.stripe_price_id).trim() !== '')
                              }
                              title="Creates a product + monthly recurring price in Stripe using the fee last saved in TechFlash. Remove the price ID first if you need a different amount."
                              onClick={() => handleProvisionStripe(r.id)}
                            >
                              {provisionBusyId === r.id ? 'Creating in Stripe…' : 'Create in Stripe'}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget({ id: r.id, slug: r.slug });
                              setDeleteConfirmText('');
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                disabled={saving || loading || provisionBusyId !== null}
                onClick={handleSaveAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          )}
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setAddOpen(false)} aria-hidden />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New tier</h3>
            <form onSubmit={handleCreateTier} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug (immutable after create)</label>
                <input
                  value={newTier.slug}
                  onChange={(e) => setNewTier((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="e.g. enterprise"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display name</label>
                <input
                  value={newTier.display_name}
                  onChange={(e) => setNewTier((p) => ({ ...p, display_name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monthly fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTier.monthly_fee_dollars}
                    onChange={(e) => setNewTier((p) => ({ ...p, monthly_fee_dollars: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Commission %</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={newTier.commission_percent}
                    onChange={(e) => setNewTier((p) => ({ ...p, commission_percent: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {audience === 'technician' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Early access delay (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={newTier.early_access_delay_hours}
                    onChange={(e) => setNewTier((p) => ({ ...p, early_access_delay_hours: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort order</label>
                <input
                  type="number"
                  value={newTier.sort_order}
                  onChange={(e) => setNewTier((p) => ({ ...p, sort_order: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stripe price ID (optional)</label>
                <input
                  value={newTier.stripe_price_id}
                  onChange={(e) => setNewTier((p) => ({ ...p, stripe_price_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-mono"
                  placeholder="price_…"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paid tiers need a <code className="text-xs">price_…</code> for subscription checkout, or add the tier and use{' '}
                  <span className="font-medium">Create in Stripe</span> in the table (after saving the fee, if you edit it).
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
            aria-hidden
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-red-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete tier?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove the <span className="font-mono font-medium">{deleteTarget.slug}</span>{' '}
              tier for this audience. Profiles must not be assigned to this tier. Type{' '}
              <span className="font-mono font-semibold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 font-mono"
              placeholder="DELETE"
              autoComplete="off"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                onClick={executeDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-40"
              >
                {deleting ? 'Deleting…' : 'Delete tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
