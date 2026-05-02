import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { profilesAPI, settingsAPI, authAPI, documentsAPI, licensingSettingsAPI, savedJobSearchesAPI } from '../api/api';
import { auth } from '../auth';
import CardPaymentForm from '../components/CardPaymentForm';
import { getStripePublishableKey, isValidStripePublishableKey } from '../stripeConfig';
import JobAddressFields from '../components/JobAddressFields';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';
import SystemControlsPricing from '../components/admin/SystemControlsPricing';
import AdminJobAccessSettings from '../components/admin/AdminJobAccessSettings';
import { needsTechnicianMapSetup } from '../utils/technicianMap';
import { requiresElectricalLicenseForState, setLocalOnlyLicenseStates } from '../utils/licensingRules';

const formatMembershipTier = (tier) => {
  const raw = String(tier || '').trim();
  if (!raw) return 'Basic';
  return raw
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const DEFAULT_EMAIL_PREFS = {
  messages: true,
  job_lifecycle: true,
  reviews: true,
  membership_updates: true,
};

const toList = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v || '').trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const SettingsPage = ({ user, onLogout, onUserUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications_enabled: true,
    job_alert_notifications_enabled: true,
    email_notification_preferences: DEFAULT_EMAIL_PREFS,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savedAlertTemplates, setSavedAlertTemplates] = useState([]);
  const [templateForm, setTemplateForm] = useState({
    keyword: '',
    location: '',
    skill_class: '',
    max_distance_miles: '',
    min_hourly_rate_cents: '',
    max_required_years_experience: '',
    required_certifications: '',
  });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [removingTemplateId, setRemovingTemplateId] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [deletingCertId, setDeletingCertId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'success' });
  const [confirmCertId, setConfirmCertId] = useState(null);
  const [settingsTab, setSettingsTab] = useState('account');
  const publishableKey = getStripePublishableKey();
  const stripe = useMemo(() => {
    if (window.Stripe && isValidStripePublishableKey(publishableKey)) {
      return window.Stripe(publishableKey);
    }
    return null;
  }, [publishableKey]);

  const isCompany = user?.role === 'company';
  const isTechnician = user?.role === 'technician';
  const isAdmin = user?.role === 'admin';
  const needsMapSetup = isTechnician && needsTechnicianMapSetup(profile);

  useEffect(() => {
    let active = true;
    licensingSettingsAPI.get()
      .then((res) => {
        if (!active) return;
        setLocalOnlyLicenseStates(res?.local_only_state_codes || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [user?.role]);

  useEffect(() => {
    if (isTechnician && profile?.id) {
      documentsAPI.getAll()
        .then((docs) => {
          const certs = (docs || []).filter(
            (d) => d.doc_type === 'certificate' && d.uploadable_type === 'TechnicianProfile' && d.uploadable_id === profile.id
          );
          setCertificates(certs);
        })
        .catch(() => setCertificates([]));
    } else {
      setCertificates([]);
    }
  }, [isTechnician, profile?.id]);

  useEffect(() => {
    setAccountEmail(user?.email || auth.getUser()?.email || '');
  }, [user?.email]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      first_name: user?.first_name || auth.getUser()?.first_name || '',
      last_name: user?.last_name || auth.getUser()?.last_name || '',
    }));
  }, [user?.first_name, user?.last_name]);

  useEffect(() => {
    setNotificationPrefs({
      email_notifications_enabled: user?.email_notifications_enabled !== false,
      job_alert_notifications_enabled: user?.job_alert_notifications_enabled !== false,
      email_notification_preferences: {
        ...DEFAULT_EMAIL_PREFS,
        ...(user?.email_notification_preferences || {}),
      },
    });
  }, [user?.email_notifications_enabled, user?.job_alert_notifications_enabled, user?.email_notification_preferences]);

  useEffect(() => {
    if (!isTechnician) {
      setSavedAlertTemplates([]);
      return;
    }
    savedJobSearchesAPI
      .list()
      .then((items) => setSavedAlertTemplates(Array.isArray(items) ? items : []))
      .catch(() => setSavedAlertTemplates([]));
  }, [isTechnician]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isCompany) {
        const p = await profilesAPI.getCompanyProfile();
        setProfile(p);
        setForm({
          company_name: p?.company_name || '',
          industry: p?.industry || '',
          location: p?.location || '',
          state: p?.state || '',
          electrical_license_number: p?.electrical_license_number || '',
          bio: p?.bio || '',
        });
      } else if (isTechnician) {
        const p = await profilesAPI.getTechnicianProfile();
        setProfile(p);
        setForm({
          trade_type: p?.trade_type || '',
          experience_years: p?.experience_years ?? '',
          availability: p?.availability || '',
          bio: p?.bio || '',
          location: p?.location || '',
          address: p?.address || '',
          city: p?.city || '',
          state: p?.state || 'Texas',
          zip_code: p?.zip_code || '',
          country: p?.country || 'United States',
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showProfileForm = isCompany || isTechnician;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const patchAddress = (patch) => {
    setForm((prev) => ({
      ...prev,
      ...(patch.address !== undefined ? { address: patch.address } : {}),
      ...(patch.city !== undefined ? { city: patch.city } : {}),
      ...(patch.state !== undefined ? { state: patch.state } : {}),
      ...(patch.zip_code !== undefined ? { zip_code: patch.zip_code } : {}),
      ...(patch.country !== undefined ? { country: patch.country } : {}),
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const firstName = (form.first_name || '').trim();
    const lastName = (form.last_name || '').trim();
    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }

    if (!isAdmin && !profile?.id) return;
    setSaving(true);
    setError(null);
    try {
      const accountRes = await authAPI.updateMe({
        first_name: firstName,
        last_name: lastName,
      });
      auth.setUser(accountRes.user);
      onUserUpdate?.(accountRes.user);

      if (isCompany) {
        const companyState = (form.state || '').trim();
        const stateRequiresLicense = requiresElectricalLicenseForState(companyState);
        if (stateRequiresLicense && !(form.electrical_license_number || '').trim()) {
          setError('This state requires an electrical license number.');
          setSaving(false);
          return;
        }
        await profilesAPI.updateCompanyProfile(profile.id, {
          ...form,
          state: companyState,
          electrical_license_number: (form.electrical_license_number || '').trim(),
        });
      } else {
        await profilesAPI.updateTechnicianProfile(profile.id, {
          ...form,
          experience_years: form.experience_years === '' ? null : parseInt(form.experience_years, 10),
        });
      }
      await fetchProfile();
      setAlertModal({ isOpen: true, title: 'Profile saved!', message: 'Your profile has been updated.', variant: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    const email = accountEmail.trim();
    if (!email) return;
    if (accountPassword && accountPassword !== accountPasswordConfirm) {
      setAccountError('Passwords do not match');
      return;
    }
    setSavingAccount(true);
    setAccountError(null);
    try {
      const payload = { email };
      if (accountPassword) {
        payload.password = accountPassword;
        payload.password_confirmation = accountPasswordConfirm;
      }
      const res = await authAPI.updateMe(payload);
      auth.setUser(res.user);
      onUserUpdate?.(res.user);
      setAccountPassword('');
      setAccountPasswordConfirm('');
      setAlertModal({
        isOpen: true,
        title: 'Account updated',
        message: email !== (user?.email || auth.getUser()?.email) ? 'Email updated. Use your new email to log in next time.' : 'Your account has been updated.',
        variant: 'success',
      });
    } catch (err) {
      setAccountError(err.message || 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const persistNotificationPrefs = async (next) => {
    setSavingNotifications(true);
    try {
      const payload = {
        email_notifications_enabled: next.email_notifications_enabled,
        job_alert_notifications_enabled: next.job_alert_notifications_enabled,
        email_notification_preferences: next.email_notification_preferences,
      };
      const res = await authAPI.updateMe(payload);
      auth.setUser(res.user);
      onUserUpdate?.(res.user);
      setAlertModal({
        isOpen: true,
        title: 'Preferences saved',
        message: 'Notification settings updated.',
        variant: 'success',
      });
      return true;
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'Update failed',
        message: err.message || 'Could not save notification settings.',
        variant: 'error',
      });
      return false;
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleNotificationToggle = async (key, value) => {
    const prev = notificationPrefs;
    const next = { ...prev, [key]: value };
    setNotificationPrefs(next);
    const ok = await persistNotificationPrefs(next);
    if (!ok) {
      setNotificationPrefs(prev);
    }
  };

  const handleEmailCategoryToggle = async (category, checked) => {
    const prev = notificationPrefs;
    const next = {
      ...prev,
      email_notification_preferences: {
        ...prev.email_notification_preferences,
        [category]: checked,
      },
    };
    setNotificationPrefs(next);
    const ok = await persistNotificationPrefs(next);
    if (!ok) setNotificationPrefs(prev);
  };

  const handleTemplateFieldChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setSavingTemplate(true);
    try {
      await savedJobSearchesAPI.create({
        keyword: templateForm.keyword || null,
        location: templateForm.location || null,
        skill_class: templateForm.skill_class || null,
        max_distance_miles: templateForm.max_distance_miles === '' ? null : Number(templateForm.max_distance_miles),
        min_hourly_rate_cents: templateForm.min_hourly_rate_cents === '' ? null : Number(templateForm.min_hourly_rate_cents),
        max_required_years_experience: templateForm.max_required_years_experience === '' ? null : Number(templateForm.max_required_years_experience),
        required_certifications: toList(templateForm.required_certifications),
      });
      const items = await savedJobSearchesAPI.list();
      setSavedAlertTemplates(Array.isArray(items) ? items : []);
      setTemplateForm({
        keyword: '',
        location: '',
        skill_class: '',
        max_distance_miles: '',
        min_hourly_rate_cents: '',
        max_required_years_experience: '',
        required_certifications: '',
      });
      setAlertModal({
        isOpen: true,
        title: 'Template saved',
        message: 'Job alert template added.',
        variant: 'success',
      });
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'Could not save',
        message: err.message || 'Could not save job alert template.',
        variant: 'error',
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleRemoveTemplate = async (id) => {
    setRemovingTemplateId(id);
    try {
      await savedJobSearchesAPI.remove(id);
      setSavedAlertTemplates((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'Remove failed',
        message: err.message || 'Could not remove template.',
        variant: 'error',
      });
    } finally {
      setRemovingTemplateId(null);
    }
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploadingCert(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploadable_type', 'TechnicianProfile');
      fd.append('uploadable_id', profile.id);
      fd.append('doc_type', 'certificate');
      await documentsAPI.upload(fd);
      const docs = await documentsAPI.getAll();
      setCertificates((docs || []).filter(
        (d) => d.doc_type === 'certificate' && d.uploadable_type === 'TechnicianProfile' && d.uploadable_id === profile.id
      ));
      setAlertModal({ isOpen: true, title: 'Certificate uploaded!', message: 'Your certificate has been added.', variant: 'success' });
    } catch (err) {
      setAlertModal({ isOpen: true, title: 'Upload failed', message: err.message || 'Failed to upload certificate', variant: 'error' });
    } finally {
      setUploadingCert(false);
      e.target.value = '';
    }
  };

  const handleCertificateDelete = (docId) => {
    setConfirmCertId(docId);
  };

  const confirmCertificateDelete = async () => {
    const docId = confirmCertId;
    setConfirmCertId(null);
    if (!docId) return;
    setDeletingCertId(docId);
    try {
      await documentsAPI.delete(docId);
      setCertificates((prev) => prev.filter((d) => d.id !== docId));
      setAlertModal({ isOpen: true, title: 'Certificate removed', message: 'The certificate has been deleted.', variant: 'success' });
    } catch (err) {
      setAlertModal({ isOpen: true, title: 'Remove failed', message: err.message || 'Failed to remove certificate', variant: 'error' });
    } finally {
      setDeletingCertId(null);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      if (isCompany) {
        await profilesAPI.updateCompanyProfile(profile.id, fd);
      } else {
        await profilesAPI.updateTechnicianProfile(profile.id, fd);
      }
      await fetchProfile();
      setAlertModal({ isOpen: true, title: 'Photo updated!', message: 'Your profile photo has been updated.', variant: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCardConfirm = async ({ card, billing_details }) => {
    setPaymentError(null);
    setPaymentSuccess(null);
    const res = await settingsAPI.createSetupIntent();
    const client_secret = res?.client_secret;
    if (!client_secret) throw new Error(res?.error || 'Could not create setup');
    if (!stripe) throw new Error('Payment form not ready');
    const { error: confirmError } = await stripe.confirmCardSetup(client_secret, {
      payment_method: { card, billing_details },
    });
    if (confirmError) throw new Error(confirmError.message);
    setPaymentSuccess('Payment method added successfully.');
  };

  const handleConnectBank = async () => {
    setPaymentError(null);
    setPaymentSuccess(null);
    try {
      const { url } = await settingsAPI.createConnectAccountLink();
      if (url) window.location.href = url;
      else throw new Error('No link received');
    } catch (err) {
      setPaymentError(err.message || 'Failed to start bank setup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} onLogout={onLogout} activePage="settings" emailVariant="simple" />

      <main
        className={`mx-auto px-4 py-8 ${settingsTab === 'system_controls' && isAdmin ? 'max-w-4xl' : 'max-w-2xl'}`}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        <section
          className="bg-white rounded-2xl shadow border border-gray-200 overflow-x-hidden"
          aria-label="Settings sections"
        >
          <div className="flex border-b border-gray-200" role="tablist" aria-label="Settings categories">
            {['account', 'profile', 'notifications', 'payment', ...(isAdmin ? ['system_controls', 'job_access'] : [])].map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`settings-tab-${id}`}
                aria-selected={settingsTab === id}
                aria-controls={`settings-panel-${id}`}
                tabIndex={settingsTab === id ? 0 : -1}
                onClick={() => setSettingsTab(id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                  settingsTab === id
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {id === 'account'
                  ? 'Account'
                  : id === 'profile'
                    ? 'Profile'
                    : id === 'notifications'
                      ? 'Notifications'
                    : id === 'payment'
                      ? 'Payment'
                      : id === 'system_controls'
                        ? 'System controls'
                        : 'Job access'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {settingsTab === 'account' && (
              <div id="settings-panel-account" role="tabpanel" aria-labelledby="settings-tab-account">
                <p className="text-sm text-gray-600 mb-4">Your email is your username. Change it here along with your password.</p>
                {accountError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{accountError}</div>
                )}
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (username)</label>
                    <input
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                    <input
                      type="password"
                      value={accountPasswordConfirm}
                      onChange={(e) => setAccountPasswordConfirm(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" disabled={savingAccount} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {savingAccount ? 'Saving...' : 'Update Account'}
                  </button>
                </form>
              </div>
            )}

            {settingsTab === 'profile' && (
              <div id="settings-panel-profile" role="tabpanel" aria-labelledby="settings-tab-profile">
          {needsMapSetup && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">Complete map setup</p>
              <p className="text-sm text-amber-800 mt-1">
                Add your full address so job maps can center correctly and show accurate nearby jobs.
              </p>
            </div>
          )}
          {isAdmin ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <p className="text-gray-500">Admin accounts do not have technician or company profiles, but you can update your name here.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  name="first_name"
                  value={form.first_name || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  name="last_name"
                  value={form.last_name || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 font-bold">
                    {(form.first_name || user?.first_name || user?.email || '?')[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                </label>
              </div>
              <div className="text-sm text-gray-500">Click to change photo</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                name="first_name"
                value={form.first_name || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                name="last_name"
                value={form.last_name || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {isCompany && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                  <input name="company_name" value={form.company_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input name="industry" value={form.industry} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Construction, HVAC" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    name="state"
                    value={form.state || ''}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. Texas"
                  />
                </div>
                {requiresElectricalLicenseForState(form.state) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Electrical license number</label>
                    <input
                      name="electrical_license_number"
                      value={form.electrical_license_number || ''}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Enter TECL license number"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {isTechnician && (
              <>
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Membership tier</p>
                  <p className="mt-1 text-lg font-semibold text-blue-900">{formatMembershipTier(profile?.membership_level)}</p>
                  <p className="mt-1 text-xs text-blue-700">Your tier controls job access timing and platform commission.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade type</label>
                  <input name="trade_type" value={form.trade_type} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Electrician, Plumber" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
                  <input type="number" min="0" name="experience_years" value={form.experience_years} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <input name="availability" value={form.availability} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Full-time, Part-time" />
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Certificates</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload images of your certifications (e.g. OSHA, EPA, trade licenses). Companies will verify these match their job requirements.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {certificates.map((doc) => (
                      <div key={doc.id} className="relative group border rounded-lg overflow-hidden bg-gray-50 w-32 h-32">
                        {doc.file_url && (
                          <img src={doc.file_url} alt="Certificate" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleCertificateDelete(doc.id)}
                          disabled={deletingCertId === doc.id}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={handleCertificateUpload} disabled={uploadingCert} />
                      {uploadingCert ? (
                        <span className="text-sm text-gray-500">Uploading...</span>
                      ) : (
                        <span className="text-3xl text-gray-400">+</span>
                      )}
                    </label>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">Your Address</h4>
                    {needsMapSetup && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Complete map setup
                      </span>
                    )}
                  </div>
                  <JobAddressFields
                    sectionTitle="Technician Address"
                    address={form.address}
                    city={form.city}
                    state={form.state}
                    zipCode={form.zip_code}
                    country={form.country}
                    onChange={patchAddress}
                  />
                  {needsMapSetup && (
                    <p className="mt-2 text-xs text-amber-800">
                      Required to enable accurate map radius and distance sorting on your dashboard.
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full border rounded-lg px-3 py-2" placeholder="Tell others about yourself or your company..." />
            </div>

            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
          )}
              </div>
            )}

            {settingsTab === 'payment' && (
              <div
                id="settings-panel-payment"
                role="tabpanel"
                aria-labelledby="settings-tab-payment"
                className="overflow-visible"
              >
          {paymentError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{paymentError}</div>}
          {paymentSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{paymentSuccess}</div>}

          {isCompany && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Credit card</h3>
              <p className="text-gray-600 mb-4">Add a credit or debit card to pay for jobs when you accept technicians.</p>
              {!isValidStripePublishableKey(publishableKey) && (
                <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  Stripe is not configured for this build. Set <code className="font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY_TEST</code> or{' '}
                  <code className="font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> in your frontend <code className="font-mono text-xs">.env</code> (must start with{' '}
                  <code className="font-mono text-xs">pk_</code>).
                </p>
              )}
              <CardPaymentForm
                stripe={stripe}
                publishableKey={publishableKey}
                onConfirm={handleAddCardConfirm}
                submitLabel="Add Card"
              />
            </div>
          )}

          {isTechnician && (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your bank account to receive payouts when jobs are completed.
                {profile?.stripe_connected && <span className="text-green-600 font-medium ml-2">✓ Connected</span>}
              </p>
              <button
                onClick={handleConnectBank}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {profile?.stripe_connected ? 'Update Bank Account' : 'Connect Bank Account'}
              </button>
            </div>
          )}

          {(isAdmin || (!isCompany && !isTechnician)) && (
            <p className="text-gray-500">Payment settings are available for companies and technicians.</p>
          )}
              </div>
            )}

            {settingsTab === 'notifications' && (
              <div
                id="settings-panel-notifications"
                role="tabpanel"
                aria-labelledby="settings-tab-notifications"
                className="space-y-6"
              >
                <div className="rounded-xl border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Emails</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control non-critical automated emails. Security and receipt emails stay enabled.
                  </p>
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-800">All automated non-critical emails</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={notificationPrefs.email_notifications_enabled}
                      disabled={savingNotifications}
                      onChange={(e) => handleNotificationToggle('email_notifications_enabled', e.target.checked)}
                    />
                  </label>
                  <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50">
                    <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-800">
                      Email types
                    </summary>
                    <div className="space-y-3 px-3 pb-3 pt-1">
                      {[
                        ['messages', 'New messages'],
                        ['job_lifecycle', 'Job lifecycle updates'],
                        ['reviews', 'Reviews and reminders'],
                        ['membership_updates', 'Membership updates and welcome emails'],
                      ].map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between gap-4">
                          <span className="text-sm text-gray-700">{label}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={notificationPrefs.email_notification_preferences?.[key] !== false}
                            disabled={savingNotifications || !notificationPrefs.email_notifications_enabled}
                            onChange={(e) => handleEmailCategoryToggle(key, e.target.checked)}
                          />
                        </label>
                      ))}
                    </div>
                  </details>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Job alerts</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {isTechnician
                      ? <>Get alerts for new jobs matching your saved searches. Save filters from the <Link to="/jobs" className="text-blue-600 hover:underline">Jobs page</Link> to tune matches.</>
                      : isCompany
                        ? 'Get job-related alerts for marketplace activity, including applications and workflow updates as these alerts expand.'
                        : 'Get marketplace job alert emails for activity tied to your account context.'}
                  </p>
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-800">Job alert emails</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={notificationPrefs.job_alert_notifications_enabled}
                      disabled={savingNotifications}
                      onChange={(e) => handleNotificationToggle('job_alert_notifications_enabled', e.target.checked)}
                    />
                  </label>

                  {isTechnician && (
                    <div className="mt-5 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Job alert templates</h4>
                      <p className="text-xs text-gray-600 mb-3">
                        Templates match jobs by criteria like distance, pay, years required, and required certifications.
                      </p>
                      <form onSubmit={handleCreateTemplate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input name="keyword" value={templateForm.keyword} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm" placeholder="Keyword (optional)" />
                        <input name="location" value={templateForm.location} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm" placeholder="Location (optional)" />
                        <input name="skill_class" value={templateForm.skill_class} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm" placeholder="Skill class (optional)" />
                        <input type="number" min="1" name="max_distance_miles" value={templateForm.max_distance_miles} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm" placeholder="Max distance (miles)" />
                        <input type="number" min="0" name="min_hourly_rate_cents" value={templateForm.min_hourly_rate_cents} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm" placeholder="Min hourly rate cents" />
                        <input type="number" min="0" name="max_required_years_experience" value={templateForm.max_required_years_experience} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm" placeholder="Max years required" />
                        <input name="required_certifications" value={templateForm.required_certifications} onChange={handleTemplateFieldChange} className="border rounded-lg px-3 py-2 text-sm md:col-span-2" placeholder="Required certs (comma separated)" />
                        <div className="md:col-span-2">
                          <button type="submit" disabled={savingTemplate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {savingTemplate ? 'Saving...' : 'Save template'}
                          </button>
                        </div>
                      </form>
                      <div className="mt-4 space-y-2">
                        {savedAlertTemplates.length === 0 && (
                          <p className="text-xs text-gray-500">No templates yet.</p>
                        )}
                        {savedAlertTemplates.map((tpl) => (
                          <div key={tpl.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2">
                            <div className="text-xs text-gray-700">
                              <p>
                                {[tpl.keyword, tpl.location, tpl.skill_class].filter(Boolean).join(' | ') || 'Template'}
                              </p>
                              <p className="text-gray-500">
                                {[
                                  tpl.max_distance_miles ? `${tpl.max_distance_miles}mi` : null,
                                  tpl.min_hourly_rate_cents ? `>= ${tpl.min_hourly_rate_cents}c/hr` : null,
                                  tpl.max_required_years_experience ? `<= ${tpl.max_required_years_experience} yrs req` : null,
                                  Array.isArray(tpl.required_certifications) && tpl.required_certifications.length > 0 ? `certs: ${tpl.required_certifications.join(', ')}` : null,
                                ].filter(Boolean).join(' | ') || 'No extra filters'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTemplate(tpl.id)}
                              disabled={removingTemplateId === tpl.id}
                              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAdmin && settingsTab === 'system_controls' && (
              <div
                id="settings-panel-system_controls"
                role="tabpanel"
                aria-labelledby="settings-tab-system_controls"
              >
                <SystemControlsPricing />
              </div>
            )}

            {isAdmin && settingsTab === 'job_access' && (
              <div
                id="settings-panel-job_access"
                role="tabpanel"
                aria-labelledby="settings-tab-job_access"
              >
                <AdminJobAccessSettings />
              </div>
            )}
          </div>
        </section>
      </main>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((p) => ({ ...p, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />

      <ConfirmModal
        isOpen={!!confirmCertId}
        onClose={() => setConfirmCertId(null)}
        onConfirm={confirmCertificateDelete}
        title="Remove certificate?"
        message="Are you sure you want to remove this certificate?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default SettingsPage;
