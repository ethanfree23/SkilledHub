import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const DmcaIpClaimsPage = () => {
  return (
    <LegalPageLayout title="DMCA and IP Claims Policy" updatedAt="April 15, 2026">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">1. Respect for Intellectual Property</h2>
        <p>
          TechFlash respects intellectual property rights and expects users to do the same. Users must not
          post, upload, or share content that infringes copyrights, trademarks, or other legal rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">2. Filing a Copyright Notice</h2>
        <p>
          If you believe content on TechFlash infringes your copyright, submit a written notice that
          includes your contact information, identification of the copyrighted work, identification of the
          allegedly infringing material, and a good-faith statement under applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">3. Counter-Notification Process</h2>
        <p>
          If your content is removed and you believe removal was in error, you may provide a
          counter-notification. If legally permitted, TechFlash may restore content after the applicable
          response period.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">4. Trademark and Other IP Complaints</h2>
        <p>
          TechFlash also reviews trademark and other IP complaints. Include details that clearly identify
          your rights and the content at issue so we can investigate efficiently.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">5. Repeat Infringer Policy</h2>
        <p>
          TechFlash may suspend or terminate accounts that repeatedly infringe or violate IP rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">6. False or Misleading Claims</h2>
        <p>
          Submitting false, fraudulent, or abusive takedown notices or counter-notices may result in legal
          liability and platform enforcement actions.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default DmcaIpClaimsPage;
