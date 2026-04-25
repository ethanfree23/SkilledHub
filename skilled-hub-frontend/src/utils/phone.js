export function formatPhoneInput(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';

  let national = digits;
  if (digits.startsWith('1')) {
    national = digits.slice(1, 11);
  } else {
    national = digits.slice(0, 10);
  }

  if (!national) return '+1';

  let formatted = `+1 (${national.slice(0, 3)}`;
  if (national.length >= 3) formatted += ')';
  if (national.length > 3) formatted += ` ${national.slice(3, 6)}`;
  if (national.length > 6) formatted += `-${national.slice(6, 10)}`;
  return formatted;
}
