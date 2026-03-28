'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ShieldCheck, KeyRound, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        setMessage(data.message);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('success');
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 p-8 max-w-md w-full border border-slate-100">
        
        {/* Step: Success */}
        {step === 'success' ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful</h1>
            <p className="text-slate-500 mb-8 font-medium">Your password has been changed. You can now login with your new credentials.</p>
            <Link 
              href="/login"
              className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all text-lg shadow-lg shadow-slate-200"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link href="/login" className="flex items-center text-slate-500 hover:text-slate-900 mb-6 group transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Login</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {step === 'email' && 'Forgot Password?'}
                {step === 'otp' && 'Check your Inbox'}
                {step === 'reset' && 'Create New Password'}
              </h1>
              <p className="text-slate-500 font-medium">
                {step === 'email' && 'Enter your email address and we will send you a 6-digit recovery code.'}
                {step === 'otp' && `We've sent a code to ${email}. Enter it below to proceed.`}
                {step === 'reset' && 'Success! Now choose a strong new password for your account.'}
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-medium mb-6 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {/* Forms */}
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
                </button>
              </form>
            )}

            {(step === 'otp' || step === 'reset') && (
              <form onSubmit={step === 'otp' ? (e) => { e.preventDefault(); setStep('reset'); } : handleVerifyReset} className="space-y-6">
                
                {step === 'otp' && (
                  <div className="relative group text-center">
                    <div className="flex justify-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Recovery Code</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-5 text-center text-3xl font-black tracking-[1em] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-900"
                    />
                  </div>
                )}

                {step === 'reset' && (
                  <>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
                      />
                    </div>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
                      />
                    </div>
                  </>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    step === 'otp' ? 'Continue' : 'Update Password'
                  )}
                </button>

                {step === 'otp' && (
                  <button 
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full text-slate-500 py-2 text-sm hover:text-slate-900 font-medium"
                  >
                    Didn't receive code? Resend
                  </button>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
