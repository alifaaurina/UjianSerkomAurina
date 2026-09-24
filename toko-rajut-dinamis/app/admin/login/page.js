'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAdmin } = useCart();
  const router = useRouter();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (
      (emailInput.trim() === 'admin@lyffa.com' || emailInput.trim() === 'admin') &&
      passwordInput === 'admin123'
    ) {
      loginAdmin({ email: 'admin@lyffa.com' });
      router.push('/admin/dashboard');
    } else {
      setLoginError('Kredensial Salah');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Login</h2>
          <p className="text-xs text-slate-500 font-medium">
            Untuk mengakses manajemen toko rajut
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Masukan email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Masuk</span>
          </button>
        </form>

      </div>
    </div>
  );
}