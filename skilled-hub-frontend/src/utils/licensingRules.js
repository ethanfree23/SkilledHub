const LOCAL_ONLY_LICENSE_STATES = new Set();

const STATE_NAME_TO_CODE = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  dc: 'DC',
  'district of columbia': 'DC',
};

export const normalizedStateCode = (state) => {
  const value = String(state || '').trim();
  if (!value) return '';
  const upper = value.toUpperCase();
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) return upper;
  return STATE_NAME_TO_CODE[value.toLowerCase()] || '';
};

export const requiresElectricalLicenseForState = (state) => {
  const code = normalizedStateCode(state);
  if (!code) return false;
  return !LOCAL_ONLY_LICENSE_STATES.has(code);
};

export const setLocalOnlyLicenseStates = (codes) => {
  LOCAL_ONLY_LICENSE_STATES.clear();
  Array.isArray(codes)
    ? codes
      .map((c) => String(c || '').trim().toUpperCase())
      .filter((c) => /^[A-Z]{2}$/.test(c))
      .forEach((c) => LOCAL_ONLY_LICENSE_STATES.add(c))
    : null;
};
