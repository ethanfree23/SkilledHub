import React, { useState, useLayoutEffect, useRef } from 'react';
import { isValidStripePublishableKey } from '../stripeConfig';

const cardStyle = {
  base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
  invalid: { color: '#9e2146' },
};

/**
 * Reusable card payment form with separate labeled fields:
 * Card number, Name on card, Expiration (MM/YY), CVC
 * Uses Stripe Elements (cardNumber, cardExpiry, cardCvc)
 */
const CardPaymentForm = ({
  stripe: stripeProp,
  publishableKey,
  onConfirm,
  submitLabel = 'Add Card',
  disabled = false,
  amountLabel,
}) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardReady, setCardReady] = useState(false);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);
  const cardNumberElRef = useRef(null);
  const cardExpiryElRef = useRef(null);
  const cardCvcElRef = useRef(null);
  const stripeRef = useRef(null);

  useLayoutEffect(() => {
    const stripeInstance =
      stripeProp ||
      (window.Stripe && isValidStripePublishableKey(publishableKey) ? window.Stripe(publishableKey) : null);
    if (!stripeInstance) return;

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
      cardExpiryElRef.current = cardExpiry;
      cardCvcElRef.current = cardCvc;
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
        cardExpiryElRef.current = null;
        cardCvcElRef.current = null;
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
  }, [stripeProp, publishableKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!cardNumberElRef.current || !cardReady || !stripeRef.current) {
      setError('Card form is not ready.');
      return;
    }
    setProcessing(true);
    try {
      await onConfirm({
        card: cardNumberElRef.current,
        billing_details: nameOnCard.trim() ? { name: nameOnCard.trim() } : undefined,
      });
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {amountLabel && <p className="text-gray-700">{amountLabel}</p>}
      <div className="space-y-4">
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
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!cardReady || processing || disabled}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : submitLabel}
      </button>
    </form>
  );
};

export default CardPaymentForm;
