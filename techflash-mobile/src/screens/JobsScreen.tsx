import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { getJobs } from '../api/jobsApi';
import { useAuth } from '../auth/AuthContext';
import type { AppStackParamList } from '../navigation/RootNavigator';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenStates';
import { Card } from '../components/ui/Card';
import { formatJobAddress } from '../utils/address';

type Nav = NativeStackNavigationProp<AppStackParamList, 'MainTabs'>;

export default function JobsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [statusFilter, setStatusFilter] = useState(user?.role === 'admin' ? '' : 'open');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getJobs({
        status: statusFilter,
        include_past: user?.role === 'admin' ? 'true' : undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, user?.role]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const canCreate = user?.role === 'company' || user?.role === 'admin';

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <TextInput
          value={statusFilter}
          onChangeText={setStatusFilter}
          style={styles.filter}
          placeholder="status (open, filled, reserved, finished, or blank for all)"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          onSubmitEditing={() => {
            setLoading(true);
            load();
          }}
        />
        <Pressable style={styles.reload} onPress={() => { setLoading(true); load(); }}>
          <Text style={styles.reloadText}>Load</Text>
        </Pressable>
      </View>

      {canCreate ? (
        <Pressable style={styles.createBtn} onPress={() => navigation.navigate('CreateJob')}>
          <Text style={styles.createBtnText}>Create job</Text>
        </Pressable>
      ) : null}

      <ErrorState error={error} />
      {loading ? (
        <LoadingState label="Loading jobs..." />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, idx) => String(item.id || idx)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primaryOrange}
            />
          }
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState label="No jobs found." />}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('JobDetail', { jobId: Number(item.id) })}>
              <Card style={styles.cardWrap}>
                <Text style={styles.title}>{String(item.title || `Job #${item.id}`)}</Text>
                <Text style={styles.sub}>{formatJobAddress(item)}</Text>
                <Text style={styles.sub}>Status: {String(item.status || 'unknown')}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 12 },
  filter: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  reload: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  reloadText: { color: colors.white, fontWeight: '700' },
  createBtn: {
    marginTop: 10,
    marginHorizontal: 14,
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  createBtnText: { color: colors.white, fontWeight: '700' },
  error: { marginTop: 8, marginHorizontal: 14, color: colors.danger },
  cardWrap: { marginBottom: 10, paddingVertical: 14 },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  sub: { color: colors.muted, marginTop: 4 },
});
