import React, { useState, useEffect } from 'react';
import { getBillingInfo, createCheckoutSession } from '../services/billingService';
import { CreditCard, Zap, Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const Billing = () => {
  const [billingInfo, setBillingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      const data = await getBillingInfo();
      setBillingInfo(data);
    } catch (err) {
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName) => {
    try {
      const data = await createCheckoutSession(planName);
      if (data.client_secret) {
        setClientSecret(data.client_secret);
        setIsModalOpen(true);
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError('Failed to initiate checkout');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSuccess = searchParams.get('success');
  const isCanceled = searchParams.get('canceled');

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Billing & Plans</h1>
          <p className="text-slate-500">Manage your organization's subscription and credits.</p>
        </div>
        
        {billingInfo && (
          <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Available Credits</span>
              <span className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="text-yellow-500" size={24} />
                {billingInfo.credits}
              </span>
            </div>
          </div>
        )}
      </div>

      {isSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400">
          <CheckCircle2 size={20} />
          <p>Subscription updated successfully! Your new credits have been added.</p>
        </div>
      )}

      {isCanceled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3 text-yellow-400">
          <AlertCircle size={20} />
          <p>Checkout was canceled. No charges were made.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <div className={`relative bg-white border ${billingInfo?.plan_name === 'basic' ? 'border-indigo-500 shadow-md' : 'border-slate-200'} rounded-3xl p-8 transition-all hover:shadow-lg`}>
          {billingInfo?.plan_name === 'basic' && (
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-500/30">
              Current Plan
            </div>
          )}
          <h3 className="text-xl font-bold text-slate-900 mb-2">Basic</h3>
          <div className="text-3xl font-bold text-slate-900 mb-6">Free</div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-indigo-500" />
              100 Initial Credits
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-indigo-500" />
              Basic Features
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-indigo-500" />
              Community Support
            </li>
          </ul>
          <button 
            disabled 
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-bold cursor-not-allowed"
          >
            {billingInfo?.plan_name === 'basic' ? 'Current' : 'Default'}
          </button>
        </div>

        {/* Silver Plan */}
        <div className={`relative bg-gradient-to-b from-slate-800 to-slate-900 border ${billingInfo?.plan_name === 'silver' ? 'border-blue-400' : 'border-slate-700'} rounded-3xl p-8 shadow-2xl transition-all hover:-translate-y-1`}>
          {billingInfo?.plan_name === 'silver' && (
             <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
             Current Plan
           </div>
          )}
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Silver
          </h3>
          <div className="text-3xl font-bold text-white mb-1">$9.99<span className="text-lg font-normal text-white/50">/mo</span></div>
          <p className="text-sm text-blue-300 mb-6">Perfect for small teams.</p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-white/80">
              <CheckCircle2 size={18} className="text-blue-400" />
              1,000 Credits Monthly
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <CheckCircle2 size={18} className="text-blue-400" />
              Advanced Analytics
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <CheckCircle2 size={18} className="text-blue-400" />
              Priority Email Support
            </li>
          </ul>
          <button 
            onClick={() => handleUpgrade('silver')}
            disabled={billingInfo?.plan_name === 'silver'}
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
              billingInfo?.plan_name === 'silver' 
                ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30'
            }`}
          >
            {billingInfo?.plan_name === 'silver' ? 'Current Plan' : 'Upgrade to Silver'}
          </button>
        </div>

        {/* Gold Plan */}
        <div className={`relative bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border ${billingInfo?.plan_name === 'gold' ? 'border-yellow-400' : 'border-yellow-500/30'} rounded-3xl p-8 backdrop-blur-xl transition-all hover:-translate-y-1 overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
          {billingInfo?.plan_name === 'gold' && (
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-yellow-500/30">
              Current Plan
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Gold <Crown size={20} className="text-yellow-400" />
          </h3>
          <div className="text-3xl font-bold text-white mb-1">$29.99<span className="text-lg font-normal text-white/50">/mo</span></div>
          <p className="text-sm text-yellow-200 mb-6">For enterprise operations.</p>
          <ul className="space-y-4 mb-8 relative z-10">
            <li className="flex items-center gap-3 text-white/90">
              <CheckCircle2 size={18} className="text-yellow-400" />
              5,000 Credits Monthly
            </li>
            <li className="flex items-center gap-3 text-white/90">
              <CheckCircle2 size={18} className="text-yellow-400" />
              All Features Unlocked
            </li>
            <li className="flex items-center gap-3 text-white/90">
              <CheckCircle2 size={18} className="text-yellow-400" />
              24/7 Dedicated Support
            </li>
          </ul>
          <button 
            onClick={() => handleUpgrade('gold')}
            disabled={billingInfo?.plan_name === 'gold'}
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg relative z-10 ${
              billingInfo?.plan_name === 'gold' 
                ? 'bg-yellow-500/20 text-yellow-300 cursor-not-allowed border border-yellow-500/30' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-yellow-500/30'
            }`}
          >
            {billingInfo?.plan_name === 'gold' ? 'Current Plan' : 'Upgrade to Gold'}
          </button>
        </div>
      </div>
    </div>
      
      {isModalOpen && (
        <PaymentModal 
          clientSecret={clientSecret} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default Billing;
