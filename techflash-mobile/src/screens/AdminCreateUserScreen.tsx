import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { createAdminUser } from '../api/adminApi';
import type { AppStackParamList } from '../navigation/RootNavigator';
import { formatUsPhone, phoneDigits } from '../utils/phone';

type Nav = NativeStackNavigationProp<AppStackParamList, 'AdminCreateUser'>;

export default function AdminCreateUserScreen() {
  const navigation = useNavigation<Nav>();
  const [role, setRole] = useState<'technician' | 'company'>('technician');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const base = {
        role,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phoneDigits(phone),
      };
      const payload =
        role === 'company'
          ? {
              ...base,
              company_name: companyName.trim(),
              industry: industry.trim(),
              state: stateVal.trim(),
            }
          : {
              ...base,
              trade_type: tradeType.trim() || 'General',
              location: location.trim(),
              availability: 'Full-time',
            };
      await createAdminUser(payload);
      setNotice('User created.');
      setTimeout(() => navigation.goBack(), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create admin-managed user</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <Text style={styles.label}>Role</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {(['technician', 'company'] as const).map((r) => (
          <Pressable key={r} style={[styles.chip, role === r && styles.chipOn]} onPress={() => setRole(r)}>
            <Text style={[styles.chipText, role === r && styles.chipTextOn]}>{r}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Field label="Email" value={email} onChangeText={setEmail} />
      <Field label="Password" value={password} onChangeText={setPassword} secure />
      <Field label="Confirm password" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secure />
      <Field label="First name" value={firstName} onChangeText={setFirstName} />
      <Field label="Last name" value={lastName} onChangeText={setLastName} />
      <Field label="Phone" value={phone} onChangeText={(v) => setPhone(formatUsPhone(v))} />

      {role === 'company' ? (
        <>
          <Field label="Company name" value={companyName} onChangeText={setCompanyName} />
          <Field label="Industry" value={industry} onChangeText={setIndustry} />
          <Field label="State" value={stateVal} onChangeText={setStateVal} />
        </>
      ) : (
        <>
          <Field label="Trade type" value={tradeType} onChangeText={setTradeType} />
          <Field label="Location" value={location} onChangeText={setLocation} />
        </>
      )}

      <Pressable style={[styles.btn, saving && { opacity: 0.7 }]} onPress={onCreate} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Creating...' : 'Create user'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.muted}
        secureTextEntry={secure}
        style={styles.input}
        autoCapitalize="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  error: { color: colors.danger, marginBottom: 8 },
  notice: { color: colors.primaryBlue, marginBottom: 8 },
  label: { marginTop: 10, marginBottom: 4, color: colors.muted, textTransform: 'uppercase', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  chipOn: { borderColor: colors.primaryOrange, backgroundColor: 'rgba(254,103,17,0.08)' },
  chipText: { color: colors.muted, textTransform: 'capitalize' },
  chipTextOn: { color: colors.primaryOrange, fontWeight: '700' },
  btn: {
    marginTop: 18,
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700' },
});
