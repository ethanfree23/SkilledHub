import React from 'react';

/**
 * Custom date-time input that shows AM above PM in the time picker.
 * The native datetime-local picker cannot be customized, so we use
 * separate date + time inputs with AM listed first.
 */
const DateTimeInput = ({ value, onChange, id, className = '' }) => {
  const pad = (n) => String(n).padStart(2, '0');
  
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

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <input
        type="date"
        value={date}
        onChange={(e) => handleChange(e.target.value, null, null, null)}
        className="border rounded px-3 py-2"
      />
      <select
        value={hour}
        onChange={(e) => handleChange(null, parseInt(e.target.value, 10), null, null)}
        className="border rounded px-2 py-2"
      >
        {hours.map((h) => (
          <option key={h} value={h}>{pad(h)}</option>
        ))}
      </select>
      <span className="text-gray-500">:</span>
      <select
        value={minute}
        onChange={(e) => handleChange(null, null, parseInt(e.target.value, 10), null)}
        className="border rounded px-2 py-2"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{pad(m)}</option>
        ))}
      </select>
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
