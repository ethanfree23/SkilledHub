import React, { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { useAuth } from '../auth/AuthContext';
import {
  createConnectAccountLink,
  getCompanyProfile,
  getMembership,
  getTechnicianProfile,
  openMembershipCheckout,
  updateCompanyProfile,
  updateMe,
  updateTechnicianProfile,
} from '../api/settingsApi';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [membership, setMembership] = useState<Record<string, unknown>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipLevel, setMembershipLevel] = useState('basic');

  const load = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      const [m, p] = await Promise.all([
        getMembership(),
        user.role === 'company' ? getCompanyProfile() : getTechnicianProfile(),
      ]);
      const profileObj = (p || {}) as Record<string, unknown>;
      setMembership((m || {}) as Record<string, unknown>);
      setProfile(profileObj);
      setFirstName(String(user.first_name || ''));
      setLastName(String(user.last_name || ''));
      setPhone(String((profileObj.phone || user.phone || '') as string));
      setMembershipLevel(String((m?.membership_level || 'basic') as string));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load settings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const onSaveAccount = async () => {
    setSaving(true);
    setError('');
    try {
      await updateMe({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      });
      if (user?.role === 'company') {
        await updateCompanyProfile(Number(profile.id), { phone: phone.trim() });
      } else if (user?.role === 'technician') {
        await updateTechnicianProfile(Number(profile.id), { phone: phone.trim() });
      }
      setNotice('Account settings updated.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save account settings');
    } finally {
      setSaving(false);
    }
  };

  const onUpdateMembership = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const success = 'https://techflash.app/settings?membership=success';
      const cancel = 'https://techflash.app/settings?membership=cancel';
      const result = await openMembershipCheckout(membershipLevel, success, cancel);
      if ((result?.checkout as Record<string, unknown> | undefined)?.url) {
        setNotice('Opened hosted checkout in browser.');
      } else {
        setNotice('Membership updated.');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update membership');
    } finally {
      setSaving(false);
    }
  };

  const onOpenPayoutOnboarding = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await createConnectAccountLink('https://techflash.app');
      const url = String(result?.url || '');
      if (!url) throw new Error('No onboarding URL returned');
      await Linking.openURL(url);
      setNotice('Opened payout onboarding.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open payout onboarding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <View style={styles.card}>
        <Text style={styles.title}>Account</Text>
        <Field label="First name" value={firstName} onChangeText={setFirstName} />
        <Field label="Last name" value={lastName} onChangeText={setLastName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} />
        <Pressable style={styles.btn} onPress={onSaveAccount} disabled={saving}>
          <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save account'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Membership</Text>
        <Text style={styles.sub}>Current: {String(membership.membership_level || 'basic')}</Text>
        <Text style={styles.sub}>
          Monthly fee: {String(((membership.monthly_fee_cents as number | undefined) || 0) / 100)}
        </Text>
        <Field
          label="Membership level"
          value={membershipLevel}
          onChangeText={setMembershipLevel}
        />
        <Pressable style={styles.btnGhost} onPress={onUpdateMembership} disabled={saving}>
          <Text style={styles.btnGhostText}>Update membership (opens hosted checkout if paid)</Text>
        </Pressable>
      </View>

      {user?.role === 'technician' ? (
        <View style={styles.card}>
          <Text style={styles.title}>Payout onboarding</Text>
          <Text style={styles.sub}>This opens Stripe Connect onboarding in your browser.</Text>
          <Pressable style={styles.btnGhost} onPress={onOpenPayoutOnboarding} disabled={saving}>
            <Text style={styles.btnGhostText}>Open payout onboarding</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 8 },
  sub: { color: colors.muted, marginBottom: 6 },
  label: { marginTop: 8, marginBottom: 4, color: colors.muted, textTransform: 'uppercase', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  btn: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: colors.primaryOrange,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700' },
  btnGhost: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnGhostText: { color: colors.text, fontWeight: '600', paddingHorizontal: 8, textAlign: 'center' },
  error: { color: colors.danger, marginBottom: 8 },
  notice: { color: colors.primaryBlue, marginBottom: 8 },
});
