import React from 'react';
import { Link } from 'react-router-dom';
import { TECHFLASH_LOGO_NAV } from '../constants/branding';

const legalLinks = [
  { to: '/legal', label: 'Legal' },
  { to: '/terms-of-service', label: 'Terms' },
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/cookie-policy', label: 'Cookies' },
  { to: '/payment-terms', label: 'Payment Terms' },
  { to: '/dmca-ip-policy', label: 'DMCA/IP' },
];

const LegalPageLayout = ({ title, updatedAt, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={TECHFLASH_LOGO_NAV} alt="TechFlash" className="h-8 object-contain" />
            <span className="font-semibold text-gray-800">TechFlash</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {legalLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-gray-600 hover:text-[#FE6711] transition whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {updatedAt}</p>
        </div>

        <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 leading-7">
          {children}
        </article>
      </main>
    </div>
  );
};

export default LegalPageLayout;
