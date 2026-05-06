import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, space, radii, typography } from '../theme';
import { Card } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GhostButton } from '../components/ui/GhostButton';
import {
  adminListTierConfigs,
  adminUpdateTierConfig,
  adminProvisionStripe,
  adminGetLicensingSettings,
  adminUpdateLicensingSettings,
  adminEmailQaListTemplates,
  adminEmailQaSend,
} from '../api/adminSystemApi';

type Audience = 'technician' | 'company';

export default function AdminSystemControlsScreen() {
  const [audience, setAudience] = useState<Audience>('technician');
  const [tiers, setTiers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [licensingCodes, setLicensingCodes] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([]);

  const loadTiers = useCallback(async () => {
    const list = await adminListTierConfigs(audience);
    setTiers(list as Record<string, unknown>[]);
  }, [audience]);

  const loadStatic = useCallback(async () => {
    const lic = await adminGetLicensingSettings();
    const codes = lic?.local_only_state_codes || [];
    setLicensingCodes(Array.isArray(codes) ? codes.join(',') : '');
    const tpl = await adminEmailQaListTemplates();
    setTemplates(Array.isArray(tpl) ? tpl : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setError('');
        try {
          await loadStatic();
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [loadStatic])
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const list = await adminListTierConfigs(audience);
        if (!cancelled) setTiers(list as Record<string, unknown>[]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load tiers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [audience]);

  const saveTierField = async (id: number, patch: Record<string, unknown>) => {
    try {
      await adminUpdateTierConfig(id, patch);
      await loadTiers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const saveLicensing = async () => {
    const codes = licensingCodes
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    try {
      await adminUpdateLicensingSettings(codes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (loading && tiers.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 48 }}>
      <Text style={typography.title}>System controls</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.audienceRow}>
        {(['technician', 'company'] as Audience[]).map((a) => (
          <Pressable
            key={a}
            onPress={() => setAudience(a)}
            style={[styles.audienceChip, audience === a && styles.audienceChipOn]}
          >
            <Text style={[styles.audienceText, audience === a && styles.audienceTextOn]}>{a}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Membership tiers</Text>
      {tiers.map((t) => {
        const id = Number(t.id);
        const feeDollars = ((Number(t.monthly_fee_cents) || 0) / 100).toFixed(2);
        return (
          <TierEditCard
            key={id}
            tier={t}
            feeDollars={feeDollars}
            onSave={(patch) => saveTierField(id, patch)}
            onProvision={async () => {
              try {
                await adminProvisionStripe(id);
                await loadTiers();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Provision failed');
              }
            }}
          />
        );
      })}

      <Text style={styles.section}>Electrical licensing (local-only states)</Text>
      <Card>
        <Text style={styles.help}>Comma-separated state codes (e.g. TX,CA)</Text>
        <TextInput
          value={licensingCodes}
          onChangeText={setLicensingCodes}
          style={styles.textArea}
          multiline
          placeholderTextColor={colors.muted}
        />
        <PrimaryButton label="Save licensing states" onPress={saveLicensing} />
      </Card>

      <Text style={styles.section}>Email QA</Text>
      <Card>
        <Text style={styles.help}>Confirm with SEND_TEST_EMAILS (same as web).</Text>
        <TextInput
          placeholder="Confirmation phrase"
          value={emailConfirm}
          onChangeText={setEmailConfirm}
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
        {templates.map((tpl) => (
          <View key={String(tpl.key)} style={styles.tpl}>
            <Text style={styles.tplName}>{String(tpl.name || tpl.key)}</Text>
            <GhostButton
              label="Send test"
              onPress={async () => {
                try {
                  const key = String(tpl.key || '');
                  await adminEmailQaSend(key, emailConfirm.trim() || 'SEND_TEST_EMAILS');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Send failed');
                }
              }}
            />
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function TierEditCard({
  tier,
  feeDollars,
  onSave,
  onProvision,
}: {
  tier: Record<string, unknown>;
  feeDollars: string;
  onSave: (patch: Record<string, unknown>) => void;
  onProvision: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(String(tier.display_name || ''));
  const [fee, setFee] = useState(feeDollars);
  const [commission, setCommission] = useState(String(tier.commission_percent ?? ''));

  useEffect(() => {
    setDisplayName(String(tier.display_name || ''));
    setFee(((Number(tier.monthly_fee_cents) || 0) / 100).toFixed(2));
    setCommission(String(tier.commission_percent ?? ''));
  }, [tier]);

  return (
    <Card>
      <Text style={typography.heading}>{String(tier.slug)}</Text>
      <Text style={styles.meta}>ID {String(tier.id)}</Text>
      <LabeledInput label="Display name" value={displayName} onChangeText={setDisplayName} />
      <PrimaryButton
        label="Save display name"
        onPress={() => onSave({ display_name: displayName.trim() })}
      />
      <LabeledInput label="Monthly fee ($)" value={fee} onChangeText={setFee} keyboardType="decimal-pad" />
      <PrimaryButton
        label="Save fee"
        onPress={() => {
          const cents = Math.round(parseFloat(fee) * 100);
          if (!Number.isNaN(cents)) onSave({ monthly_fee_cents: cents });
        }}
      />
      <LabeledInput label="Commission %" value={commission} onChangeText={setCommission} keyboardType="decimal-pad" />
      <PrimaryButton
        label="Save commission"
        onPress={() => {
          const n = parseFloat(commission);
          if (!Number.isNaN(n)) onSave({ commission_percent: n });
        }}
      />
      <GhostButton label="Provision Stripe price" onPress={onProvision} />
    </Card>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  error: { color: colors.danger, marginBottom: 8 },
  section: { ...typography.caption, marginTop: space.lg, marginBottom: space.sm },
  audienceRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  audienceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  audienceChipOn: { borderColor: colors.tabActive, backgroundColor: colors.primaryBlueMuted },
  audienceText: { fontWeight: '600', color: colors.muted, textTransform: 'capitalize' },
  audienceTextOn: { color: colors.tabActive },
  meta: { color: colors.muted, fontSize: 12, marginBottom: 6 },
  help: { color: colors.muted, fontSize: 13, marginBottom: 8 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 10,
    minHeight: 72,
    textAlignVertical: 'top',
    color: colors.text,
    marginBottom: 10,
  },
  tpl: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  tplName: { fontWeight: '600', marginBottom: 6, color: colors.text },
});
