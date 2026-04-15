import React, { useState, useLayoutEffect, useRef } from 'react';
import { paymentsAPI, jobsAPI } from '../api/api';
import { getStripePublishableKey, isValidStripePublishableKey } from '../stripeConfig';

const cardStyle = {
  base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
  invalid: { color: '#9e2146' },
};

const AcceptPaymentModal = ({ isOpen, onClose, jobId, amountCents, onSuccess }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardReady, setCardReady] = useState(false);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);
  const cardNumberElRef = useRef(null);
  const stripeRef = useRef(null);

  const publishableKey = getStripePublishableKey();

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!window.Stripe || !isValidStripePublishableKey(publishableKey)) return;

    const stripeInstance = window.Stripe(publishableKey);
    let cancelled = false;
    let unmount = () => {};

    const mountAll = () => {
      const elNum = cardNumberRef.current;
      const elExp = cardExpiryRef.current;
      const elCvc = cardCvcRef.current;
      if (!elNum || !elExp || !elCvc) return false;

      let cardNumber;
      let cardExpiry;
      let cardCvc;
      try {
        stripeRef.current = stripeInstance;
        const elements = stripeInstance.elements();
        cardNumber = elements.create('cardNumber', { style: cardStyle });
        cardExpiry = elements.create('cardExpiry', { style: cardStyle });
        cardCvc = elements.create('cardCvc', { style: cardStyle });
        cardNumber.mount(elNum);
        cardExpiry.mount(elExp);
        cardCvc.mount(elCvc);
      } catch {
        try {
          cardNumber?.unmount();
        } catch {
          /* ignore */
        }
        try {
          cardExpiry?.unmount();
        } catch {
          /* ignore */
        }
        try {
          cardCvc?.unmount();
        } catch {
          /* ignore */
        }
        if (!cancelled) setError('Could not load card form');
        return true;
      }

      if (cancelled) {
        cardNumber.unmount();
        cardExpiry.unmount();
        cardCvc.unmount();
        return true;
      }

      cardNumberElRef.current = cardNumber;
      setCardReady(true);

      unmount = () => {
        try {
          cardNumber.unmount();
        } catch {
          /* ignore */
        }
        try {
          cardExpiry.unmount();
        } catch {
          /* ignore */
        }
        try {
          cardCvc.unmount();
        } catch {
          /* ignore */
        }
        cardNumberElRef.current = null;
        stripeRef.current = null;
        setCardReady(false);
      };
      return true;
    };

    setError(null);
    setCardReady(false);

    let rafId = 0;
    let attempts = 0;
    const maxAttempts = 40;

    const tick = () => {
      if (cancelled) return;
      if (mountAll()) return;
      attempts += 1;
      if (attempts >= maxAttempts) {
        setError('Could not load card form');
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      unmount();
    };
  }, [isOpen, publishableKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!cardNumberElRef.current || !cardReady) return;
    setProcessing(true);
    try {
      const res = await paymentsAPI.createIntent(jobId);
      const clientSecret = res?.client_secret;
      if (!clientSecret) throw new Error('Could not create payment');
      const stripe = stripeRef.current;
      if (!stripe) throw new Error('Payment form not ready');
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElRef.current,
          billing_details: nameOnCard.trim() ? { name: nameOnCard.trim() } : undefined,
        },
      });
      if (confirmError) throw new Error(confirmError.message);
      if (paymentIntent?.status === 'succeeded') {
        await jobsAPI.accept(jobId, { payment_intent_id: paymentIntent.id });
        onSuccess?.();
        onClose();
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const amount = (amountCents / 100).toFixed(2);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[51]">
        <h2 className="text-xl font-bold mb-4">Payment</h2>
        <p className="text-gray-700 mb-4">
          Pay <span className="font-semibold">${amount}</span> to accept this technician. Funds are held until the job is complete and both parties have reviewed (or 3 days pass).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
            <div
              ref={cardNumberRef}
              className="relative z-10 p-3 border border-gray-300 rounded-lg bg-white min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name on card</label>
            <input
              type="text"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration date (MM/YY)</label>
              <div
                ref={cardExpiryRef}
                className="relative z-10 p-3 border border-gray-300 rounded-lg bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <div
                ref={cardCvcRef}
                className="relative z-10 p-3 border border-gray-300 rounded-lg bg-white min-h-[44px]"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!cardReady || processing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Pay $${amount} & Accept`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptPaymentModal;
