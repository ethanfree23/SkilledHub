import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import {
  createCrmLead,
  createCrmNote,
  getCrmLead,
  updateCrmLead,
  updateCrmNote,
} from '../api/adminApi';
import type { AppStackParamList } from '../navigation/RootNavigator';

type DetailRoute = RouteProp<AppStackParamList, 'AdminCrmDetail'>;

type LeadState = {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
};

const EMPTY_LEAD: LeadState = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  status: 'new',
  notes: '',
};

export default function AdminCrmDetailScreen() {
  const route = useRoute<DetailRoute>();
  const crmLeadId = route.params?.crmLeadId;
  const isCreate = !crmLeadId;

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lead, setLead] = useState<LeadState>(EMPTY_LEAD);
  const [timeline, setTimeline] = useState<Record<string, unknown>[]>([]);
  const [newNoteBody, setNewNoteBody] = useState('');

  const load = useCallback(async () => {
    if (!crmLeadId) return;
    setError('');
    try {
      const { crmLead, crmNotes } = await getCrmLead(crmLeadId);
      setLead({
        name: String(crmLead.name || ''),
        contact_name: String(crmLead.contact_name || ''),
        email: String(crmLead.email || ''),
        phone: String(crmLead.phone || ''),
        status: String(crmLead.status || 'new'),
        notes: String(crmLead.notes || ''),
      });
      setTimeline(Array.isArray(crmNotes) ? crmNotes : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load CRM lead');
    } finally {
      setLoading(false);
    }
  }, [crmLeadId]);

  useFocusEffect(
    useCallback(() => {
      if (!crmLeadId) return;
      setLoading(true);
      load();
    }, [crmLeadId, load])
  );

  const title = useMemo(
    () => (isCreate ? 'Create CRM lead' : lead.name || lead.contact_name || `Lead #${crmLeadId}`),
    [isCreate, lead.name, lead.contact_name, crmLeadId]
  );

  const onSaveLead = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        name: lead.name.trim(),
        contact_name: lead.contact_name.trim(),
        email: lead.email.trim(),
        phone: lead.phone.trim(),
        status: lead.status.trim() || 'new',
        notes: lead.notes.trim(),
      };

      if (isCreate) {
        const created = await createCrmLead(payload);
        const createdLead = created?.crm_lead as Record<string, unknown> | undefined;
        setNotice(createdLead?.id ? `Created lead #${createdLead.id}. Go back and reopen to manage notes.` : 'Lead created.');
        setLead(EMPTY_LEAD);
        setNewNoteBody('');
      } else if (crmLeadId) {
        await updateCrmLead(crmLeadId, payload);
        setNotice('Lead saved.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save CRM lead');
    } finally {
      setSaving(false);
    }
  };

  const onAddTimelineNote = async () => {
    if (!crmLeadId || !newNoteBody.trim()) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await createCrmNote(crmLeadId, {
        body: newNoteBody.trim(),
        title: 'Mobile note',
        contact_method: 'app',
        made_contact: true,
      });
      setNewNoteBody('');
      setNotice('Timeline note added.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add note');
    } finally {
      setSaving(false);
    }
  };

  const onMarkNoteFollowUp = async (note: Record<string, unknown>) => {
    if (!crmLeadId || !note.id) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await updateCrmNote(crmLeadId, Number(note.id), {
        title: String(note.title || 'Mobile note'),
        body: String(note.body || ''),
        contact_method: String(note.contact_method || 'app'),
        made_contact: false,
      });
      setNotice('Note marked for follow-up.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <View style={styles.card}>
        <Text style={styles.section}>Lead profile</Text>
        <Field label="Company / lead name" value={lead.name} onChangeText={(v) => setLead((s) => ({ ...s, name: v }))} />
        <Field label="Contact name" value={lead.contact_name} onChangeText={(v) => setLead((s) => ({ ...s, contact_name: v }))} />
        <Field label="Email" value={lead.email} onChangeText={(v) => setLead((s) => ({ ...s, email: v }))} autoCapitalize="none" />
        <Field label="Phone" value={lead.phone} onChangeText={(v) => setLead((s) => ({ ...s, phone: v }))} />
        <Field label="Status" value={lead.status} onChangeText={(v) => setLead((s) => ({ ...s, status: v }))} />
        <Field
          label="General notes"
          value={lead.notes}
          onChangeText={(v) => setLead((s) => ({ ...s, notes: v }))}
          multiline
        />
        <Pressable style={[styles.primaryBtn, saving && styles.disabled]} onPress={onSaveLead} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : isCreate ? 'Create lead' : 'Save lead'}</Text>
        </Pressable>
      </View>

      {!isCreate ? (
        <View style={styles.card}>
          <Text style={styles.section}>Timeline notes</Text>
          <Field
            label="Add note"
            value={newNoteBody}
            onChangeText={setNewNoteBody}
            multiline
          />
          <Pressable style={[styles.secondaryBtn, saving && styles.disabled]} onPress={onAddTimelineNote} disabled={saving}>
            <Text style={styles.secondaryBtnText}>Add timeline note</Text>
          </Pressable>

          {timeline.length === 0 ? (
            <Text style={styles.muted}>No timeline notes yet.</Text>
          ) : (
            timeline.map((note) => (
              <View key={String(note.id)} style={styles.noteCard}>
                <Text style={styles.noteTitle}>{String(note.title || 'Note')}</Text>
                <Text style={styles.noteBody}>{String(note.body || '')}</Text>
                <Text style={styles.noteMeta}>
                  Method: {String(note.contact_method || 'n/a')} | Contacted: {String(note.made_contact)}
                </Text>
                <Pressable
                  style={styles.followUpBtn}
                  onPress={() => onMarkNoteFollowUp(note)}
                >
                  <Text style={styles.followUpBtnText}>Mark follow-up needed</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  autoCapitalize,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  autoCapitalize?: 'none' | 'sentences';
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.muted}
        autoCapitalize={autoCapitalize || 'sentences'}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 10 },
  section: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  error: { color: colors.danger, marginBottom: 8 },
  notice: { color: colors.primaryBlue, marginBottom: 8 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  label: { color: colors.muted, fontSize: 12, marginBottom: 4, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: colors.text,
    backgroundColor: colors.white,
  },
  primaryBtn: {
    marginTop: 4,
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700' },
  secondaryBtn: {
    marginTop: 2,
    marginBottom: 12,
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.white, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  muted: { color: colors.muted, marginTop: 6 },
  noteCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: colors.bg,
  },
  noteTitle: { color: colors.text, fontWeight: '700' },
  noteBody: { color: colors.text, marginTop: 4 },
  noteMeta: { color: colors.muted, marginTop: 6, fontSize: 12 },
  followUpBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  followUpBtnText: { color: colors.text, fontWeight: '600', fontSize: 12 },
});
