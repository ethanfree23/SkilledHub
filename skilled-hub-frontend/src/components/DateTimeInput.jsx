import React from 'react';

/**
 * Custom date-time input that shows AM above PM in the time picker.
 * The native datetime-local picker cannot be customized, so we use
 * separate date + time inputs with AM listed first.
 */
const DateTimeInput = ({ value, onChange, id, className = '' }) => {
  const pad = (n) => String(n).padStart(2, '0');
  const normalizeListWithSelectedFirst = (items, selected) => {
    const withoutSelected = items.filter((item) => item !== selected);
    return [selected, ...withoutSelected];
  };
  
  const parseValue = (val) => {
    if (!val) return { date: '', hour: 12, minute: 0, ampm: 'AM' };
    const d = new Date(val);
    const hour12 = d.getHours() % 12 || 12;
    const ampm = d.getHours() < 12 ? 'AM' : 'PM';
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      hour: hour12,
      minute: d.getMinutes(),
      ampm,
    };
  };

  const buildValue = (date, hour, minute, ampm) => {
    if (!date) return '';
    let h = hour;
    if (ampm === 'PM') h = hour === 12 ? 12 : hour + 12;
    else h = hour === 12 ? 0 : hour;
    return `${date}T${pad(h)}:${pad(minute)}`;
  };

  const { date, hour, minute, ampm } = parseValue(value);

  const handleChange = (newDate, newHour, newMinute, newAmpm) => {
    const val = buildValue(newDate || date, newHour ?? hour, newMinute ?? minute, newAmpm || ampm);
    onChange({ target: { value: val } });
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ..., 55
  const displayHours = normalizeListWithSelectedFirst(hours, hour);
  const displayMinutes = normalizeListWithSelectedFirst(
    minute % 5 === 0 ? minutes : [...minutes, minute].sort((a, b) => a - b),
    minute,
  );
  const parseHourInput = (rawValue) => {
    const digits = String(rawValue || '').replace(/\D/g, '');
    if (!digits) return null;
    const nextHour = parseInt(digits, 10);
    if (Number.isNaN(nextHour)) return null;
    return Math.min(12, Math.max(1, nextHour));
  };
  const parseMinuteInput = (rawValue) => {
    const digits = String(rawValue || '').replace(/\D/g, '');
    if (!digits) return null;
    const nextMinute = parseInt(digits, 10);
    if (Number.isNaN(nextMinute)) return null;
    return Math.min(59, Math.max(0, nextMinute));
  };

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <input
        type="date"
        value={date}
        onChange={(e) => handleChange(e.target.value, null, null, null)}
        className="border rounded px-3 py-2"
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{1,2}"
        list={id ? `${id}-hour-options` : undefined}
        value={pad(hour)}
        onChange={(e) => {
          const parsed = parseHourInput(e.target.value);
          if (parsed != null) handleChange(null, parsed, null, null);
        }}
        className="border rounded px-2 py-2 w-14"
        aria-label="Hour"
      />
      {id ? (
        <datalist id={`${id}-hour-options`}>
          {displayHours.map((h) => (
            <option key={h} value={pad(h)} />
          ))}
        </datalist>
      ) : null}
      <span className="text-gray-500">:</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{1,2}"
        list={id ? `${id}-minute-options` : undefined}
        value={pad(minute)}
        onChange={(e) => {
          const parsed = parseMinuteInput(e.target.value);
          if (parsed != null) handleChange(null, null, parsed, null);
        }}
        className="border rounded px-2 py-2 w-14"
        aria-label="Minute"
      />
      {id ? (
        <datalist id={`${id}-minute-options`}>
          {displayMinutes.map((m) => (
            <option key={m} value={pad(m)} />
          ))}
        </datalist>
      ) : null}
      <select
        value={ampm}
        onChange={(e) => handleChange(null, null, null, e.target.value)}
        className="border rounded px-2 py-2"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default DateTimeInput;
