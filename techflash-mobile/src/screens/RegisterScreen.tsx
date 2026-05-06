import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';
import { formatUsPhone, phoneDigits } from '../utils/phone';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [role, setRole] = useState<'technician' | 'company'>('technician');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phoneDigits(phone),
        city: city.trim(),
        state: stateVal.trim(),
        zip_code: zipCode.trim(),
        address: address.trim(),
        role,
        membership_tier: 'basic',
        honeypot: '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.note}>
          Basic membership signup (no card required). Paid tiers with Stripe can be completed on the website.
        </Text>
        {error ? (
          <View style={styles.errBox}>
            <Text style={styles.errText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.section}>I am a…</Text>
        <View style={styles.roleRow}>
          <Pressable
            style={[styles.roleChip, role === 'technician' && styles.roleChipOn]}
            onPress={() => setRole('technician')}
          >
            <Text style={[styles.roleChipText, role === 'technician' && styles.roleChipTextOn]}>Technician</Text>
          </Pressable>
          <Pressable
            style={[styles.roleChip, role === 'company' && styles.roleChipOn]}
            onPress={() => setRole('company')}
          >
            <Text style={[styles.roleChipText, role === 'company' && styles.roleChipTextOn]}>Company</Text>
          </Pressable>
        </View>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field label="Password" value={password} onChangeText={setPassword} secure />
        <Field label="Confirm password" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secure />
        <Field label="First name" value={firstName} onChangeText={setFirstName} />
        <Field label="Last name" value={lastName} onChangeText={setLastName} />
        <Field label="Phone" value={phone} onChangeText={(v) => setPhone(formatUsPhone(v))} keyboardType="phone-pad" />
        <Field label="City" value={city} onChangeText={setCity} />
        <Field label="State" value={stateVal} onChangeText={setStateVal} placeholder="e.g. TX" />
        <Field label="ZIP" value={zipCode} onChangeText={setZipCode} keyboardType="numbers-and-punctuation" />
        <Field label="Street address (optional)" value={address} onChangeText={setAddress} />

        <Pressable
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Creating…' : 'Create account'}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secure,
  keyboardType,
  autoCapitalize,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'sentences';
  placeholder?: string;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 48 },
  note: { color: colors.muted, marginBottom: 12, fontSize: 14, lineHeight: 20 },
  errBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errText: { color: colors.danger, fontSize: 14 },
  section: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  roleChipOn: {
    borderColor: colors.primaryOrange,
    backgroundColor: 'rgba(254, 103, 17, 0.08)',
  },
  roleChipText: { fontWeight: '600', color: colors.muted },
  roleChipTextOn: { color: colors.primaryOrange },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    marginBottom: 14,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.primaryOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { color: colors.primaryBlue, fontWeight: '600', fontSize: 15 },
});
