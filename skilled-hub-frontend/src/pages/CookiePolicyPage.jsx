import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const CookiePolicyPage = () => {
  return (
    <LegalPageLayout title="Cookie Policy" updatedAt="April 15, 2026">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">1. What Are Cookies</h2>
        <p>
          Cookies are small text files stored on your device. They help websites remember your actions
          and preferences across sessions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">2. How TechFlash Uses Cookies</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Authentication and session management.</li>
          <li>Security and fraud prevention.</li>
          <li>Performance monitoring and diagnostics.</li>
          <li>Feature functionality and user experience improvements.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">3. Cookie Categories</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Strictly necessary:</strong> required for core platform functions.
          </li>
          <li>
            <strong>Functional:</strong> help remember settings and preferences.
          </li>
          <li>
            <strong>Analytics:</strong> help us understand usage patterns and improve the service.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">4. Third-Party Technologies</h2>
        <p>
          Some cookies or similar technologies may be set by service providers that support hosting,
          analytics, security, and payment processing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">5. Your Choices</h2>
        <p>
          You can control cookies through your browser settings, including blocking or deleting cookies.
          Disabling certain cookies may affect site functionality.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">6. Updates</h2>
        <p>
          TechFlash may update this Cookie Policy from time to time to reflect operational, legal, or
          technical changes.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default CookiePolicyPage;
