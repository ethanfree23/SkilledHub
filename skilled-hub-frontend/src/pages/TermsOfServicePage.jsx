import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const TermsOfServicePage = () => {
  return (
    <LegalPageLayout title="Terms of Service" updatedAt="April 15, 2026">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
        <p>
          By creating an account or using TechFlash, you agree to these Terms of Service. If you are
          using TechFlash on behalf of a company, you confirm that you have authority to bind that
          company to these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">2. Platform Role</h2>
        <p>
          TechFlash provides a marketplace that helps companies and technicians connect. TechFlash is
          not the employer of technicians and is not a party to direct agreements between users unless
          stated otherwise in writing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">3. Accounts and Security</h2>
        <p>
          You are responsible for maintaining accurate account information and protecting your login
          credentials. You must promptly report any unauthorized account activity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">4. Acceptable Use</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Do not submit fraudulent, misleading, or unlawful job or profile information.</li>
          <li>Do not harass, threaten, or discriminate against other users.</li>
          <li>Do not attempt to disrupt, reverse engineer, or misuse the platform.</li>
          <li>Do not upload content that violates another party&apos;s rights.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">5. Jobs, Payments, and Disputes</h2>
        <p>
          Companies and technicians are responsible for confirming scope, scheduling, and completion
          requirements. Payment flows offered through TechFlash may be subject to third-party processor
          terms. Each party remains responsible for taxes and legal obligations tied to its transactions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">6. Content and License</h2>
        <p>
          You retain ownership of content you submit, but you grant TechFlash a non-exclusive license to
          host, store, and display that content as needed to operate and improve the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">7. Suspension and Termination</h2>
        <p>
          TechFlash may suspend or terminate accounts that violate these terms, create legal risk, or
          harm users or platform integrity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">8. Disclaimers and Limitation of Liability</h2>
        <p>
          The service is provided on an &quot;as is&quot; basis to the extent allowed by law. TechFlash is not
          liable for indirect, incidental, special, consequential, or punitive damages arising from your
          use of the platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">9. Updates to These Terms</h2>
        <p>
          TechFlash may update these terms from time to time. Continued use of the service after updates
          become effective means you accept the revised terms.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;
