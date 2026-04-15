import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout title="Privacy Policy" updatedAt="April 15, 2026">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">1. Scope</h2>
        <p>
          This Privacy Policy explains how TechFlash collects, uses, discloses, and protects personal
          data when you use our website and related services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">2. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Account details such as email, role type, and login credentials.</li>
          <li>Profile and job-related details you provide on the platform.</li>
          <li>Messages, support communications, and transaction metadata.</li>
          <li>Device and usage information such as browser type, IP address, and activity logs.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">3. How We Use Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide, maintain, and improve the TechFlash marketplace.</li>
          <li>To match companies and technicians and facilitate communications.</li>
          <li>To process transactions and secure platform activity.</li>
          <li>To respond to support requests and enforce platform policies.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">4. How We Share Information</h2>
        <p>
          We may share data with service providers, payment processors, infrastructure partners, and when
          required by law. We may also share information to prevent fraud, abuse, or security incidents.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">5. Data Retention</h2>
        <p>
          We retain personal information for as long as needed to operate the service, satisfy legal
          obligations, resolve disputes, and enforce our agreements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">6. Security</h2>
        <p>
          TechFlash uses reasonable administrative, technical, and organizational safeguards. No security
          method is perfect, so we cannot guarantee absolute security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">7. Your Choices and Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or restrict use of
          your personal data. You may also request account deletion through support channels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">8. Children&apos;s Privacy</h2>
        <p>
          TechFlash is not directed to children under 13, and we do not knowingly collect personal data
          from children.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">9. Policy Updates</h2>
        <p>
          We may update this policy periodically. Continued use of TechFlash after updates are effective
          indicates acceptance of the revised policy.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;
