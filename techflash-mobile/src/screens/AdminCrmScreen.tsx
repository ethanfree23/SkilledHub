import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { listCrmLeads } from '../api/adminApi';
import type { AppStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList, 'MainTabs'>;

export default function AdminCrmScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await listCrmLeads();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load CRM leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primaryOrange} size="large" /></View>;
  }

  return (
    <View style={styles.root}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.createBtn} onPress={() => navigation.navigate('AdminCrmDetail', {})}>
        <Text style={styles.createBtnText}>Create CRM lead</Text>
      </Pressable>
      <FlatList
        data={rows}
        keyExtractor={(item, idx) => String((item.id as number | undefined) || idx)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primaryOrange} />}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
        ListEmptyComponent={<Text style={styles.empty}>No CRM leads found.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('AdminCrmDetail', {
                crmLeadId: Number(item.id),
              })
            }
          >
            <Text style={styles.name}>{String(item.name || item.contact_name || 'CRM lead')}</Text>
            {!!item.email && <Text style={styles.sub}>{String(item.email)}</Text>}
            {!!item.phone && <Text style={styles.sub}>{String(item.phone)}</Text>}
            {!!item.status && <Text style={styles.sub}>Status: {String(item.status)}</Text>}
            {!!item.company_types && <Text style={styles.sub}>Types: {Array.isArray(item.company_types) ? item.company_types.join(', ') : String(item.company_types)}</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  createBtn: {
    backgroundColor: colors.primaryOrange,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  createBtnText: { color: colors.white, fontWeight: '700' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  name: { color: colors.text, fontWeight: '700', fontSize: 16 },
  sub: { color: colors.muted, marginTop: 4 },
  error: { color: colors.danger, marginHorizontal: 14, marginTop: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 30 },
});
