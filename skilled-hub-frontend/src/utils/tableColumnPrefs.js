/** Server + localStorage keys for which table’s column layout is being edited (namespaced). */
export const TABLE_COLUMN_IDS = {
  adminUsers: 'admin_users',
  crmPipeline: 'crm_pipeline',
};

export function columnsFromSavedArray(parsed, defaultColumns) {
  const defaultMap = new Map(defaultColumns.map((c) => [c.key, c]));
  const fromSaved = parsed
    .map((c) => {
      const base = defaultMap.get(c.key);
      if (!base) return null;
      return { ...base, visible: c.visible !== false };
    })
    .filter(Boolean);
  const missing = defaultColumns.filter((c) => !fromSaved.some((x) => x.key === c.key));
  return [...fromSaved, ...missing];
}

export function serializeTableColumns(cols) {
  return cols.map((c) => ({ key: c.key, visible: c.visible !== false }));
}

export function normalizeSavedColumnsJson(saved) {
  if (!Array.isArray(saved)) return '';
  const normalized = saved.map((c) => ({
    key: String(c.key),
    visible: c.visible !== false && c.visible !== 'false',
  }));
  return JSON.stringify(normalized);
}

/** Resolve saved column array from user prefs + legacy shapes. */
export function getSavedColumnsArrayForTable(user, tableId, legacyFlatKey = null) {
  const fromNested = user?.ui_preferences?.table_columns?.[tableId];
  if (Array.isArray(fromNested) && fromNested.length > 0) return fromNested;

  if (legacyFlatKey && tableId === TABLE_COLUMN_IDS.adminUsers) {
    const legacy = user?.ui_preferences?.[legacyFlatKey];
    if (Array.isArray(legacy) && legacy.length > 0) return legacy;
  }
  return null;
}
