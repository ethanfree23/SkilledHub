import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import UserTypeBadge from './UserTypeBadge';
import UserStatusBadge from './UserStatusBadge';
import UserVerificationBadge from './UserVerificationBadge';
import UserRiskBadge from './UserRiskBadge';
import UserRowActionsMenu from './UserRowActionsMenu';
import UsersEmptyState from './UsersEmptyState';
import { TableRowsSkeleton } from './UsersSkeleton';
import { displayOrFallback } from '../../../utils/adminUsersDisplayAdapter';

/** Tablet: hide subscription, membership tier, risk, jobs */
const HIDDEN_MD = new Set(['jobs', 'risk', 'subscription', 'membership_tier']);
/** Mobile table (lg breakpoint): also hide location, last_login, joined */
const HIDDEN_LG = new Set(['location', 'last_login', 'joined']);

function Muted({ children, title }) {
  return (
    <span className="text-xs text-slate-400 truncate block min-w-0" title={title || (typeof children === 'string' ? children : undefined)}>
      {children}
    </span>
  );
}

function CellText({ children, title, className = 'text-xs text-slate-700' }) {
  const tip = title || (typeof children === 'string' ? children : undefined);
  return (
    <span className={`block min-w-0 truncate ${className}`} title={tip}>
      {children}
    </span>
  );
}

function SortIndicator({ colKey, sortKey, sortDir }) {
  if (colKey !== sortKey) {
    return <FaSort className="w-2.5 h-2.5 shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />;
  }
  return sortDir === 'asc' ? (
    <FaSortUp className="w-2.5 h-2.5 shrink-0 text-tf-blue" aria-hidden />
  ) : (
    <FaSortDown className="w-2.5 h-2.5 shrink-0 text-tf-blue" aria-hidden />
  );
}

function UserCell({ row }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/80 flex items-center justify-center text-[10px] font-bold text-slate-600">
        {row.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-slate-900 truncate leading-tight">{row.displayName}</div>
        <div className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">{row.email}</div>
      </div>
    </div>
  );
}

function renderCell(col, row) {
  switch (col.key) {
    case 'user':
      return <UserCell row={row} />;
    case 'type':
      return (
        <div className="min-w-0 overflow-hidden">
          <UserTypeBadge role={row.role} />
        </div>
      );
    case 'status':
      return (
        <div className="min-w-0 overflow-hidden">
          <UserStatusBadge status={row.accountStatus} />
        </div>
      );
    case 'verification':
      return (
        <div className="min-w-0 overflow-hidden">
          <UserVerificationBadge status={row.verificationStatus} />
        </div>
      );
    case 'company_trade':
      return <CellText title={row.companyTradeLabel}>{row.companyTradeLabel}</CellText>;
    case 'location':
      return row.locationLabel === 'Not provided' ? (
        <Muted title="Location not provided">Not provided</Muted>
      ) : (
        <CellText className="text-xs text-slate-600" title={row.locationLabel}>{row.locationLabel}</CellText>
      );
    case 'subscription':
      return (
        <CellText
          title={[displayOrFallback(row.subscriptionTier, 'Free'), row.subscriptionStatus].filter(Boolean).join(' · ')}
        >
          {displayOrFallback(row.subscriptionTier, 'Free')}
        </CellText>
      );
    case 'membership_tier':
      return (
        <CellText title={displayOrFallback(row.membershipTier, 'Free')}>
          {displayOrFallback(row.membershipTier, 'Free')}
        </CellText>
      );
    case 'activity':
      return (
        <CellText
          className={`text-xs ${row.activityLabel?.isEmpty ? 'text-slate-400' : 'text-slate-700'}`}
          title={[row.activityLabel?.logins, row.activityLabel?.lastActive].filter(Boolean).join(' · ') || 'No activity yet'}
        >
          {row.activityLabel?.logins || 'No activity yet'}
        </CellText>
      );
    case 'jobs':
      if (row.jobsSummary) {
        if (row.role === 'technician') {
          const label = `${row.jobsSummary.accepted} acc · ${row.jobsSummary.completed} done`;
          return <CellText className="text-[11px] text-slate-600" title={label}>{label}</CellText>;
        }
        const label = `${row.jobsSummary.posted} posted · ${row.jobsSummary.filled} filled`;
        return <CellText className="text-[11px] text-slate-600" title={label}>{label}</CellText>;
      }
      return <Muted title="Open user drawer for job details">—</Muted>;
    case 'joined':
      return (
        <CellText className="text-xs text-slate-600 tabular-nums">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
            : '—'}
        </CellText>
      );
    case 'last_login':
      return (
        <CellText
          className={`text-xs ${row.lastLoginAt ? 'text-slate-600' : 'text-slate-400'}`}
          title={row.lastLoginDisplay || 'No activity yet'}
        >
          {row.lastLoginDisplay || 'No activity yet'}
        </CellText>
      );
    case 'risk':
      return (
        <div className="min-w-0 overflow-hidden">
          <UserRiskBadge level={row.riskLevel || 'Low'} />
        </div>
      );
    default:
      return <Muted>—</Muted>;
  }
}

function colHiddenClass(key, asCol = false) {
  if (HIDDEN_LG.has(key)) return asCol ? 'hidden xl:table-column' : 'hidden xl:table-cell';
  if (HIDDEN_MD.has(key)) return asCol ? 'hidden lg:table-column' : 'hidden lg:table-cell';
  return '';
}

function colWidthClass(key) {
  if (key === 'user') return 'w-[18%]';
  if (key === 'joined' || key === 'risk' || key === 'jobs') return 'w-[5.5%]';
  return '';
}

function UserMobileCard({ row, selected, onSelect, onRowClick, onViewProfile, actions }) {
  return (
    <div
      className="rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm active:bg-slate-50/50 transition-colors"
      onClick={() => onRowClick(row)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onRowClick(row)}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => { e.stopPropagation(); onSelect(row.id); }}
          className="mt-2 rounded border-slate-300 shrink-0"
          aria-label={`Select ${row.displayName}`}
        />
        <div className="flex-1 min-w-0">
          <UserCell row={row} />
          <div className="mt-2 flex flex-wrap gap-1">
            <UserTypeBadge role={row.role} />
            <UserStatusBadge status={row.accountStatus} />
          </div>
          <p className={`mt-1.5 text-[11px] ${row.activityLabel?.isEmpty ? 'text-slate-400' : 'text-slate-500'}`}>
            {row.activityLabel?.logins || 'No activity yet'}
            {row.activityLabel?.lastActive ? ` · ${row.activityLabel.lastActive}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
          <button
            type="button"
            onClick={() => onViewProfile?.(row)}
            className="text-[11px] font-semibold text-tf-blue flex items-center gap-0.5"
          >
            View
            <FaChevronRight className="w-2 h-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersTable({
  rows,
  columns,
  loading,
  loadError,
  emptyVariant,
  onEmptyAction,
  onRetry,
  selectedIds,
  onSelect,
  onSelectAll,
  onRowClick,
  onViewProfile,
  onMasquerade,
  onSendEmail,
  onResetPassword,
  onDelete,
  onPlaceholderAction,
  masqueradeBusyId,
  sortKey,
  sortDir,
  onSort,
}) {
  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    const dir = sortDir === 'asc' ? 1 : -1;
    copy.sort((a, b) => {
      const getVal = (row, key) => {
        switch (key) {
          case 'user': return row.displayName?.toLowerCase() || '';
          case 'type': return row.role || '';
          case 'status': return row.accountStatus || '';
          case 'verification': return row.verificationStatus || '';
          case 'company_trade': return row.companyTradeLabel || '';
          case 'location': return row.locationLabel || '';
          case 'subscription': return row.subscriptionTier || '';
          case 'membership_tier': return row.membershipTier || '';
          case 'activity': return row.logins30d ?? 0;
          case 'jobs': return row.jobsSummary?.accepted ?? row.jobsSummary?.posted ?? 0;
          case 'joined': return row.created_at ? new Date(row.created_at).getTime() : 0;
          case 'last_login': return row.lastLoginAt ? new Date(row.lastLoginAt).getTime() : 0;
          case 'risk': return row.riskLevel || '';
          default: return '';
        }
      };
      const av = getVal(a, sortKey);
      const bv = getVal(b, sortKey);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' }) * dir;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="flex-1 min-h-[16rem] w-full rounded-lg border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <TableRowsSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 min-h-[16rem] w-full flex flex-col">
        <UsersEmptyState variant="error" onAction={onRetry} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex-1 min-h-[16rem] w-full flex flex-col">
        <UsersEmptyState variant={emptyVariant} onAction={onEmptyAction} />
      </div>
    );
  }

  const rowActions = (row, compact = false) => (
    <UserRowActionsMenu
      user={row}
      onMasquerade={onMasquerade}
      onSendEmail={onSendEmail}
      onResetPassword={onResetPassword}
      onDelete={onDelete}
      onPlaceholderAction={onPlaceholderAction}
      masqueradeBusy={masqueradeBusyId === row.id}
      compact={compact}
    />
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full">
      <div className="lg:hidden space-y-2 overflow-y-auto">
        {sortedRows.map((row) => (
          <UserMobileCard
            key={row.id}
            row={row}
            selected={selectedIds.has(row.id)}
            onSelect={onSelect}
            onRowClick={onRowClick}
            onViewProfile={onViewProfile}
            actions={rowActions(row, true)}
          />
        ))}
      </div>

      <div className="hidden lg:flex flex-1 min-h-0 w-full flex-col rounded-lg border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-8" />
              {visibleColumns.map((col) => (
                <col key={col.key} className={`${colWidthClass(col.key)} ${colHiddenClass(col.key, true)}`} />
              ))}
              <col className="w-14" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/80">
              <tr>
                <th className="w-8 px-1.5 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    aria-label="Select all"
                    className="rounded border-slate-300"
                  />
                </th>
                {visibleColumns.map((col) => (
                  <th key={col.key} className={`px-1.5 py-2 text-left min-w-0 overflow-hidden ${colHiddenClass(col.key)}`}>
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className={`group inline-flex max-w-full items-start gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-left leading-tight ${
                        sortKey === col.key ? 'text-tf-blue' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="min-w-0 break-words">{col.label}</span>
                      <SortIndicator colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                ))}
                <th className="w-14 px-1.5 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="group/row hover:bg-slate-50/90 cursor-pointer transition-colors"
                >
                  <td className="px-1.5 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => onSelect(row.id)}
                      aria-label={`Select ${row.displayName}`}
                      className="rounded border-slate-300"
                    />
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={`px-1.5 py-2 align-middle min-w-0 overflow-hidden ${colHiddenClass(col.key)}`}>
                      {renderCell(col, row)}
                    </td>
                  ))}
                  <td className="px-1 py-2 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover/row:opacity-100 transition-opacity">
                      <Link
                        to={`/admin/users/${row.id}`}
                        className="p-1 rounded-md text-slate-400 hover:text-tf-blue hover:bg-blue-50/50 transition-colors"
                        title="View profile"
                      >
                        <FaChevronRight className="w-3 h-3" />
                      </Link>
                      {rowActions(row, true)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="shrink-0 px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400">
          {sortedRows.length} user{sortedRows.length === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}
