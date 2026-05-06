import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import { useAuth } from '../auth/AuthContext';
import {
  deleteAdminUser,
  ensureAdminUserProfile,
  getAdminUser,
  sendAdminPasswordSetup,
  setAdminUserPassword,
  setAdminCompanyMembership,
  startMasquerade,
  updateAdminMembershipPricing,
  updateAdminUserProfile,
} from '../api/adminApi';
import type { AppStackParamList } from '../navigation/RootNavigator';
import type { User } from '../types/user';

type DetailRoute = RouteProp<AppStackParamList, 'AdminUserDetail'>;

function renderKV(title: string, value: unknown) {
  if (value == null) return null;
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.k}>{title}</Text>
      <Text style={styles.v}>{str}</Text>
    </View>
  );
}

export default function AdminUserDetailScreen() {
  const { setSessionFromAuthPayload } = useAuth();
  const route = useRoute<DetailRoute>();
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profileDraft, setProfileDraft] = useState<Record<string, string>>({});
  const [membershipDraft, setMembershipDraft] = useState({
    membership_level: 'basic',
    membership_fee_waived: false,
    membership_fee_override_cents: '',
    commission_override_percent: '',
  });
  const [companyProfileRelinkId, setCompanyProfileRelinkId] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getAdminUser(userId, '7d');
      setPayload(data);
      const user = (data.user || {}) as Record<string, unknown>;
      const profile = (user.profile || {}) as Record<string, unknown>;
      setProfileDraft({
        first_name: String(user.first_name || ''),
        last_name: String(user.last_name || ''),
        phone: String(user.phone || ''),
        company_name: String(profile.company_name || ''),
        industry: String(profile.industry || ''),
        location: String(profile.location || ''),
        bio: String(profile.bio || ''),
        trade_type: String(profile.trade_type || ''),
        availability: String(profile.availability || ''),
      });
      setMembershipDraft({
        membership_level: String(profile.membership_level || 'basic'),
        membership_fee_waived: !!profile.membership_fee_waived,
        membership_fee_override_cents:
          profile.membership_fee_override_cents == null
            ? ''
            : String(profile.membership_fee_override_cents),
        commission_override_percent:
          profile.commission_override_percent == null
            ? ''
            : String(profile.commission_override_percent),
      });
      const companyContext = (user.company_context || {}) as Record<string, unknown>;
      setCompanyProfileRelinkId(String(companyContext.company_profile_id || profile.id || ''));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load user detail');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const onSendSetup = async () => {
    try {
      const res = await sendAdminPasswordSetup(userId);
      setNotice(res?.message || 'Password setup email sent.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not send setup email');
    }
  };

  const onRelinkCompany = async () => {
    const id = Number(companyProfileRelinkId);
    if (!id) {
      setError('Enter a valid company profile id.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await setAdminCompanyMembership(userId, id);
      setNotice(res?.message || 'Company membership updated.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not relink company membership');
    } finally {
      setSaving(false);
    }
  };

  const onEnsureProfile = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await ensureAdminUserProfile(userId);
      setNotice(res?.message || 'Profile ensured.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not ensure profile');
    } finally {
      setSaving(false);
    }
  };

  const onSetPassword = async () => {
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await setAdminUserPassword(userId, password, passwordConfirmation);
      setNotice(res?.message || 'Password updated.');
      setPassword('');
      setPasswordConfirmation('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not set password');
    } finally {
      setSaving(false);
    }
  };

  const onSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await updateAdminUserProfile(userId, profileDraft);
      setNotice('Profile updated.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const onSaveMembership = async () => {
    setSaving(true);
    setError('');
    try {
      await updateAdminMembershipPricing(userId, {
        membership_level: membershipDraft.membership_level,
        membership_fee_waived: membershipDraft.membership_fee_waived,
        membership_fee_override_cents: membershipDraft.membership_fee_override_cents,
        commission_override_percent: membershipDraft.commission_override_percent,
      });
      setNotice('Membership pricing updated.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update membership pricing');
    } finally {
      setSaving(false);
    }
  };

  const onMasquerade = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await startMasquerade(userId);
      if (!res?.token || !res?.user) throw new Error('Invalid masquerade response');
      await setSessionFromAuthPayload(res.token, res.user as User);
      setNotice('Masquerade started.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start masquerade');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteUser = async () => {
    setSaving(true);
    setError('');
    try {
      await deleteAdminUser(userId);
      setNotice('User deleted. Go back to user list.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primaryOrange} size="large" /></View>;
  }

  const user = (payload.user || {}) as Record<string, unknown>;
  const profile = (user.profile || {}) as Record<string, unknown>;
  const isCompany = profile.type === 'company';
  const isTech = profile.type === 'technician';
  const roleAnalytics = ((isCompany ? payload.payments : payload.applications) || {}) as Record<string, unknown>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <View style={styles.card}>
        <Text style={styles.title}>User</Text>
        {renderKV('Email', user.email)}
        {renderKV('Role', user.role)}
        {renderKV('Name', [user.first_name, user.last_name].filter(Boolean).join(' '))}
        {renderKV('Phone', user.phone)}
        <View style={styles.row}>
          <Pressable style={styles.actionBtn} onPress={onSendSetup}>
            <Text style={styles.actionBtnText}>Send setup email</Text>
          </Pressable>
          <Pressable style={styles.actionBtnGhost} onPress={onEnsureProfile}>
            <Text style={styles.actionBtnGhostText}>Ensure profile</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Profile ({isCompany ? 'company group' : isTech ? 'technician group' : 'user'})
        </Text>
        {renderKV('ID', profile.id)}
        {renderKV('Company', profile.company_name)}
        {renderKV('Trade', profile.trade_type)}
        {renderKV('Location', profile.location)}
        {renderKV('Membership', profile.membership_level)}
        <Field
          label="First name"
          value={profileDraft.first_name || ''}
          onChangeText={(v) => setProfileDraft((p) => ({ ...p, first_name: v }))}
        />
        <Field
          label="Last name"
          value={profileDraft.last_name || ''}
          onChangeText={(v) => setProfileDraft((p) => ({ ...p, last_name: v }))}
        />
        <Field
          label={isCompany ? 'Company name' : isTech ? 'Trade type' : 'Label'}
          value={isCompany ? profileDraft.company_name || '' : profileDraft.trade_type || ''}
          onChangeText={(v) =>
            setProfileDraft((p) =>
              isCompany ? { ...p, company_name: v } : { ...p, trade_type: v }
            )
          }
        />
        <Field
          label="Location"
          value={profileDraft.location || ''}
          onChangeText={(v) => setProfileDraft((p) => ({ ...p, location: v }))}
        />
        <Field
          label="Bio"
          value={profileDraft.bio || ''}
          onChangeText={(v) => setProfileDraft((p) => ({ ...p, bio: v }))}
        />
        {isCompany ? (
          <>
            <Field
              label="Company profile id (relink)"
              value={companyProfileRelinkId}
              onChangeText={setCompanyProfileRelinkId}
            />
            <Pressable style={styles.actionBtnGhost} onPress={onRelinkCompany} disabled={saving}>
              <Text style={styles.actionBtnGhostText}>Relink company membership</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable style={styles.actionBtn} onPress={onSaveProfile} disabled={saving}>
          <Text style={styles.actionBtnText}>{saving ? 'Saving...' : 'Save profile'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Membership pricing</Text>
        <Field
          label="Membership level"
          value={membershipDraft.membership_level}
          onChangeText={(v) => setMembershipDraft((p) => ({ ...p, membership_level: v }))}
        />
        <Field
          label="Fee override cents (blank for default)"
          value={membershipDraft.membership_fee_override_cents}
          onChangeText={(v) => setMembershipDraft((p) => ({ ...p, membership_fee_override_cents: v }))}
        />
        <Field
          label="Commission override percent (blank for default)"
          value={membershipDraft.commission_override_percent}
          onChangeText={(v) => setMembershipDraft((p) => ({ ...p, commission_override_percent: v }))}
        />
        <Pressable
          style={[styles.actionBtnGhost, membershipDraft.membership_fee_waived && styles.actionBtnGhostOn]}
          onPress={() =>
            setMembershipDraft((p) => ({
              ...p,
              membership_fee_waived: !p.membership_fee_waived,
            }))
          }
        >
          <Text style={styles.actionBtnGhostText}>
            Fee waived: {membershipDraft.membership_fee_waived ? 'Yes' : 'No'}
          </Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onSaveMembership} disabled={saving}>
          <Text style={styles.actionBtnText}>
            {saving ? 'Saving...' : 'Save membership pricing'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Access + safety</Text>
        <Field
          label="Set new password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <Field
          label="Confirm password"
          value={passwordConfirmation}
          secureTextEntry
          onChangeText={setPasswordConfirmation}
        />
        <Pressable style={styles.actionBtn} onPress={onSetPassword} disabled={saving}>
          <Text style={styles.actionBtnText}>{saving ? 'Saving...' : 'Set password'}</Text>
        </Pressable>
        <View style={styles.row}>
          <Pressable style={styles.actionBtnGhost} onPress={onMasquerade} disabled={saving}>
            <Text style={styles.actionBtnGhostText}>Masquerade</Text>
          </Pressable>
          <Pressable style={styles.deleteBtn} onPress={onDeleteUser} disabled={saving}>
            <Text style={styles.deleteBtnText}>Delete user</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Role analytics ({isCompany ? 'company group' : isTech ? 'technician group' : 'user'})
        </Text>
        {Object.entries(roleAnalytics).map(([k, v]) => renderKV(k, v))}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.k}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
        placeholder={label}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 8 },
  k: { fontSize: 12, color: colors.muted, textTransform: 'uppercase' },
  v: { fontSize: 14, color: colors.text, marginTop: 2 },
  actionBtn: {
    marginTop: 12,
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: colors.white, fontWeight: '700' },
  actionBtnGhost: {
    marginTop: 12,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  actionBtnGhostOn: {
    borderColor: colors.primaryOrange,
    backgroundColor: 'rgba(254,103,17,0.08)',
  },
  actionBtnGhostText: { color: colors.text, fontWeight: '600' },
  deleteBtn: {
    marginTop: 12,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  deleteBtnText: { color: colors.danger, fontWeight: '700' },
  input: {
    marginTop: 4,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: colors.text,
    backgroundColor: colors.white,
  },
  row: { flexDirection: 'row', gap: 8 },
  error: { color: colors.danger, marginBottom: 10 },
  notice: { color: colors.primaryBlue, marginBottom: 10 },
});
