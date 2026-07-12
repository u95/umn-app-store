/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { uid: string; email: string }) => void;
  onNavigate: (page: string) => void;
  onLoginSubmit: (email: string, password: string) => Promise<{ uid: string; email: string }>;
}

export default function LoginView({ onLoginSuccess, onNavigate, onLoginSubmit }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all requested fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loggedUser = await onLoginSubmit(email, password);
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(loggedUser);
        onNavigate('admin');
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-zinc-50 dark:bg-zinc-950 transition-colors" id="login-view-container">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl p-8 space-y-8 relative overflow-hidden">
        
        {/* Play Store colored top indicator border */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-600" />

        {/* Brand identity */}
        <div className="flex flex-col items-center text-center space-y-3 select-none">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/15">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 3.5C5.07 3.5 4.91 3.56 4.78 3.67L13.19 12.08L17.7 7.57C17.02 7.14 11.23 3.82 5.25 3.5Z" />
              <path d="M4.05 4.96C4.02 5.12 4 5.3 4 5.5V18.5C4 18.7 4.02 18.88 4.05 19.04L12.5 10.59L4.05 4.96Z" opacity="0.9" />
              <path d="M4.78 20.33C4.91 20.44 5.07 20.5 5.25 20.5C11.23 20.18 17.02 16.86 17.7 16.43L13.19 11.92L4.78 20.33Z" />
              <path d="M18.42 15.17L14.28 12.65L14.26 12.64L14.12 12.5L14.26 12.36L14.28 12.35L18.42 9.83C19.22 9.34 19.8 9.92 19.53 10.8L18.83 12.5L19.53 14.2C19.8 15.08 19.22 15.66 18.42 15.17Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">Console Sign In</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mt-2">UMN Play Console Workspace</p>
          </div>
        </div>

        {/* Status Warnings */}
        {error && (
          <div className="flex gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold leading-relaxed animate-fade-in">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2.5 p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold leading-relaxed animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500 animate-bounce" />
            <span>Success! Granting access token. Redirecting to Play Console...</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1" htmlFor="email-input">
              Developer Email
            </label>
            <div className="relative flex items-center h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-xl transition-all px-3.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
              <Mail className="w-5 h-5 text-zinc-400" />
              <input
                id="email-input"
                type="email"
                required
                disabled={loading || success}
                placeholder="developer@umn.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-none pl-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pl-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider" htmlFor="password-input">
                Console Passcode
              </label>
            </div>
            <div className="relative flex items-center h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-xl transition-all px-3.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
              <Lock className="w-5 h-5 text-zinc-400" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading || success}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 outline-none pl-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 active:scale-98 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all text-sm tracking-tight"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying console credentials...</span>
              </>
            ) : (
              <span>Proceed to Console</span>
            )}
          </button>
        </form>

        <hr className="border-zinc-100 dark:border-zinc-800/60" />

        {/* Onboarding Credentials Tip Card */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 space-y-2.5">
          <p className="text-[11px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            Console Test Credentials
          </p>
          <div className="grid grid-cols-1 gap-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <p>Email: <span className="font-bold text-zinc-800 dark:text-zinc-200">admin@umn.edu</span></p>
            <p>Password: <span className="font-bold text-zinc-800 dark:text-zinc-200">admin123</span></p>
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-400">
            * Note: In Sandbox mode, we permit any credentials that start with <code className="text-zinc-600">admin</code> for manual testing overrides!
          </p>
        </div>

      </div>
    </div>
  );
}
