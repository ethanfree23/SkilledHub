import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../components/LegalPageLayout';

const documents = [
  {
    to: '/terms-of-service',
    title: 'Terms of Service',
    description:
      'Rules for using TechFlash, account responsibilities, acceptable use, and platform limitations.',
  },
  {
    to: '/privacy-policy',
    title: 'Privacy Policy',
    description:
      'What personal data we collect, how we use it, when we share it, and your data rights.',
  },
  {
    to: '/cookie-policy',
    title: 'Cookie Policy',
    description:
      'How cookies and similar technologies are used to keep the site secure and improve performance.',
  },
  {
    to: '/payment-terms',
    title: 'Payment Terms',
    description:
      'Payment processing rules, refund expectations, dispute handling, and chargeback responsibilities.',
  },
  {
    to: '/dmca-ip-policy',
    title: 'DMCA and IP Claims Policy',
    description:
      'How to report copyright or trademark infringement and how counter-notifications are handled.',
  },
];

const LegalPage = () => {
  return (
    <LegalPageLayout title="Legal Information" updatedAt="April 15, 2026">
      <section className="space-y-4">
        <p>
          This page contains TechFlash legal documents for companies, technicians, and visitors.
          Using the platform means you agree to review and follow these terms.
        </p>
        <p>
          If you do not agree with a document, please stop using the related services until the issue
          is resolved.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Available documents</h2>
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.to}
              to={doc.to}
              className="block rounded-xl border border-gray-200 p-4 hover:border-[#FE6711] hover:shadow-sm transition"
            >
              <h3 className="font-semibold text-gray-900">{doc.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Questions</h2>
        <p>
          For legal or policy questions, contact the TechFlash support team through the in-app support
          channel or your existing account contact.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default LegalPage;
