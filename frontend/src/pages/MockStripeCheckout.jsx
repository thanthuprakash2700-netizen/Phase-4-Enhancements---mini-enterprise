import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

const MockStripeCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const plan = searchParams.get('plan');
  const amount = plan === 'silver' ? '$9.99' : '$29.99';

  useEffect(() => {
    // Simulate Stripe loading
    document.title = "Stripe Checkout";
  }, []);

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Redirect back to billing with success
      window.location.href = '/billing?success=true';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          
          {/* Left Column - Order Summary */}
          <div className="md:w-5/12 bg-[#f7fafc] p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-200">
            <button onClick={() => navigate(-1)} className="text-[#635BFF] flex items-center gap-1 text-sm font-medium hover:text-[#0A2540] transition-colors mb-8">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="mb-8">
              <h2 className="text-[#0A2540] opacity-70 text-sm font-semibold mb-1 uppercase tracking-wider">TaskFlow Enterprise</h2>
              <div className="text-4xl font-bold text-[#0A2540]">{amount}</div>
              <div className="text-[#425466] mt-2 font-medium">per month</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[#0A2540] font-medium">
                <span>{plan === 'silver' ? 'Silver' : 'Gold'} Plan Subscription</span>
                <span>{amount}</span>
              </div>
              <div className="h-px bg-slate-200 w-full my-4"></div>
              <div className="flex justify-between items-center text-[#0A2540] font-bold text-lg">
                <span>Total due today</span>
                <span>{amount}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="md:w-7/12 p-8 md:p-12">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-16 h-6 bg-[#635BFF] rounded text-white font-bold text-xs flex items-center justify-center">stripe</div>
              <span className="text-sm font-semibold text-[#425466] flex items-center gap-1">
                <Lock size={14} /> Test Mode
              </span>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0A2540] mb-2">Email</label>
                <input required type="email" defaultValue="test@example.com" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#635BFF] focus:border-transparent outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A2540] mb-2">Card Information</label>
                <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#635BFF] transition-all bg-white">
                  <div className="relative border-b border-slate-300">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input required type="text" placeholder="Card number" defaultValue="4242 4242 4242 4242" className="w-full pl-10 pr-4 py-3 outline-none" />
                  </div>
                  <div className="flex">
                    <input required type="text" placeholder="MM / YY" defaultValue="12 / 25" className="w-1/2 px-4 py-3 outline-none border-r border-slate-300" />
                    <input required type="text" placeholder="CVC" defaultValue="123" className="w-1/2 px-4 py-3 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A2540] mb-2">Name on card</label>
                <input required type="text" placeholder="Jane Doe" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#635BFF] focus:border-transparent outline-none transition-all" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-[#0A2540] hover:bg-[#1A3550] text-white rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center h-14"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : `Pay ${amount}`}
              </button>

              <p className="text-center text-xs text-[#425466] mt-6">
                By confirming your subscription, you allow TaskFlow to charge your card for this payment and future payments in accordance with their terms.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MockStripeCheckout;
