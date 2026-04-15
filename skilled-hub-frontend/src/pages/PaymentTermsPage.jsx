import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const PaymentTermsPage = () => {
  return (
    <LegalPageLayout title="Payment Terms" updatedAt="April 15, 2026">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">1. Scope</h2>
        <p>
          These Payment Terms govern payments processed through TechFlash between companies and
          technicians. By using platform payment features, you agree to these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">2. Payment Processing</h2>
        <p>
          TechFlash may use third-party payment processors. Processing times, payout methods, and
          verification requirements may depend on those providers and applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">3. Fees and Charges</h2>
        <p>
          Platform fees, processor fees, taxes, and similar charges may apply. Users are responsible for
          reviewing all displayed amounts before confirming a transaction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">4. Refunds and Cancellations</h2>
        <p>
          Refund eligibility depends on job status, platform records, and dispute review. Cancellations
          made after work begins may not be fully refundable. TechFlash may issue partial or full refunds
          where appropriate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">5. Disputes</h2>
        <p>
          If a payment dispute occurs, both parties should provide timely and accurate information.
          TechFlash may hold funds during investigation and decide outcomes based on available evidence,
          platform activity, and applicable terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">6. Chargebacks and Reversals</h2>
        <p>
          Users are responsible for unauthorized or improper chargebacks. TechFlash may recover reversed
          amounts, suspend accounts, or restrict payment functionality when necessary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">7. Updates</h2>
        <p>
          We may revise these Payment Terms as our services or legal obligations change. Continued use of
          payment features after updates means you accept the revised terms.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PaymentTermsPage;
