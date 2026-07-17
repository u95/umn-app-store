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
  onRegisterSubmit?: (email: string, password: string) => Promise<{ uid: string; email: string }>;
}

export default function LoginView({ onLoginSuccess, onNavigate, onLoginSubmit, onRegisterSubmit }: LoginViewProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும் / Please fill in all requested fields.");
      return;
    }

    if (password.length < 6) {
      setError("கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும் / Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isRegisterMode) {
        // Register new user
        if (!onRegisterSubmit) {
          throw new Error("Registration is not available here / இந்தப்பக்கத்தில் புதிய கணக்கு பதிவு செய்ய இயலாது.");
        }
        const loggedUser = await onRegisterSubmit(email, password);
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(loggedUser);
          onNavigate('admin');
        }, 1200);
      } else {
        // Sign in existing user
        const loggedUser = await onLoginSubmit(email, password);
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(loggedUser);
          onNavigate('admin');
        }, 1200);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let errMsg = err.message || "An authentication error occurred.";
      
      // Provide explicit, user-friendly instructions on Firebase auth errors
      if (errMsg.includes("auth/invalid-credential") || errMsg.includes("INVALID_LOGIN_CREDENTIALS")) {
        errMsg = "உள்நுழைவு விவரங்கள் தவறானவை. நீங்கள் இன்னும் கணக்கு உருவாக்கவில்லை எனில், மேலே உள்ள 'பதிவு செய் (Register)' டேப்பை கிளிக் செய்து புதிய கணக்கை உருவாக்கிக் கொள்ளவும்! / Incorrect password or email. If you haven't created an account in your custom Firebase yet, click the 'Register' tab above to create one!";
      } else if (errMsg.includes("auth/email-already-in-use")) {
        errMsg = "இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவாகியுள்ளது. 'உள்நுழை (Sign In)' மூலம் முயற்சிக்கவும். / This email is already registered. Please use 'Sign In' instead.";
      } else if (errMsg.includes("auth/operation-not-allowed")) {
        errMsg = "உங்கள் Firebase Console-இல் Email/Password உள்நுழைவு முறை இயக்கப்படவில்லை. / Email/Password provider is not enabled in your Firebase Auth Console. Please enable it under Firebase Auth -> Sign-in method.";
      } else if (errMsg.includes("Registration is only supported")) {
        errMsg = "புதிய கணக்கு பதிவு செய்ய நீங்கள் முதலில் Settings & Sync பக்கத்தில் உங்கள் சொந்த Firebase API Keys-ஐ இணைக்க வேண்டும். / To register a custom account, you must first connect your own Firebase project in the Settings page.";
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-zinc-50 dark:bg-zinc-950 transition-colors" id="login-view-container">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl p-8 space-y-7 relative overflow-hidden">
        
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
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
              {isRegisterMode ? "Create Account" : "Console Sign In"}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-2 pl-0.5">
              {isRegisterMode ? "பதிவு செய்தல் / Registration Workspace" : "உள்நுழைவு / Play Console Workspace"}
            </p>
          </div>
        </div>

        {/* Tab switcher for Sign In vs Register */}
        <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-150 dark:border-zinc-850">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isRegisterMode
                ? 'bg-white dark:bg-zinc-900 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            உள்நுழை (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isRegisterMode
                ? 'bg-white dark:bg-zinc-900 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            பதிவு செய் (Register)
          </button>
        </div>

        {/* Status Warnings */}
        {error && (
          <div className="flex gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium leading-relaxed animate-fade-in whitespace-pre-line">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2.5 p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold leading-relaxed animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500 animate-bounce" />
            <span>
              {isRegisterMode 
                ? "கணக்கு உருவாக்கப்பட்டது! கன்சோலுக்குச் செல்கிறது... / Account registered successfully! Accessing Play Console..." 
                : "உள்நுழைவு வெற்றி! கன்சோலுக்குச் செல்கிறது... / Sign-In Success! Accessing Play Console..."
              }
            </span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1" htmlFor="email-input">
              Developer Email / மின்னஞ்சல்
            </label>
            <div className="relative flex items-center h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-xl transition-all px-3.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
              <Mail className="w-5 h-5 text-zinc-400" />
              <input
                id="email-input"
                type="email"
                required
                disabled={loading || success}
                placeholder="developer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-none pl-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pl-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider" htmlFor="password-input">
                Console Passcode / கடவுச்சொல்
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
                <span>உறுதிசெய்யப்படுகிறது / Processing authentication...</span>
              </>
            ) : (
              <span>
                {isRegisterMode ? "கணக்கை உருவாக்கு (Create Account)" : "உள்நுழையவும் (Sign In)"}
              </span>
            )}
          </button>
        </form>

        <hr className="border-zinc-100 dark:border-zinc-800/60" />

        {/* Onboarding Credentials Tip Card */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
          <p className="text-[11px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            வழிமுறை / Instructions
          </p>
          {isRegisterMode ? (
            <p className="text-[11px]">
              உங்கள் சொந்த Firebase API Keys-ஐ வெற்றிகரமாக இணைத்த பிறகு, உங்கள் மின்னஞ்சல் முகவரியை (<code className="font-bold text-zinc-800 dark:text-zinc-200">umnministry@gmail.com</code>) மற்றும் உங்களுக்கு பிடித்த கடவுச்சொல்லை உள்ளிட்டு <strong>"கணக்கை உருவாக்கு (Create Account)"</strong> என்பதைக் கிளிக் செய்யவும். இது உங்கள் சொந்த Firebase Authentication தரவுத்தளத்தில் புதிய கணக்கை உருவாக்கும்.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px]">
                நீங்கள் இன்னும் உங்கள் சொந்த Firebase-ஐ இணைக்கவில்லை எனில், கீழே உள்ள டெமோ கணக்கைப் பயன்படுத்தலாம் (In Sandbox mode, you can use these test credentials):
              </p>
              <div className="grid grid-cols-1 gap-0.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 pl-2 border-l-2 border-zinc-200 dark:border-zinc-800">
                <p>Email: <span className="font-bold">admin@umn.edu</span></p>
                <p>Password: <span className="font-bold">admin123</span></p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
