import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const PaymentModal = ({ clientSecret, onClose }) => {
  if (!clientSecret) return null;

  // Mock flow check: If it's our backend mock, just simulate success
  if (clientSecret === "pi_mock_secret") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Mock Payment</h2>
            <p className="text-slate-500">
              This is a simulated payment for local development because no real Stripe keys were provided.
            </p>
            <button
              onClick={() => {
                window.location.href = '/billing?success=true';
              }}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors w-full"
            >
              Simulate Successful Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const options = { clientSecret };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors z-10"
        >
          <X size={20} />
        </button>
        <div className="p-4 md:p-8 pt-16">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
