import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '' };
    if (pwd.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 10) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (pwd.length < 14) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = !isLogin ? getPasswordStrength(password) : null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError(null);
        alert('✅ Account created! Check your email for verification link.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#070A12]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-br from-[#66E6FF]/20 to-[#8A7CFF]/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-[#8A7CFF]/20 to-[#66E6FF]/20 rounded-full blur-[140px] animate-pulse animation-delay-1s"></div>
        <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] bg-[#66E6FF]/10 rounded-full blur-[100px] animate-pulse animation-delay-2s"></div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#66E6FF] to-[#8A7CFF] flex items-center justify-center shadow-[0_0_30px_rgba(102,230,255,0.3)]">
              <div className="w-8 h-8 rounded-full bg-[#070A12] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#66E6FF] to-[#8A7CFF]"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-wider text-white">
              ORBIT
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Welcome back to the future of communication' : 'Begin your journey across language barriers'}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="relative backdrop-blur-2xl bg-[#0B1630]/60 border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#66E6FF]/5 to-[#8A7CFF]/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 p-1 bg-black/20 rounded-xl">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-[#66E6FF] to-[#5AC8DE] text-[#070A12] shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-[#66E6FF] to-[#5AC8DE] text-[#070A12] shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-start gap-3 animate-shake">
              <span className="material-symbols-outlined text-red-400 text-xl">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <label className={`block text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${
                emailFocused ? 'text-[#66E6FF]' : 'text-gray-400'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border transition-all text-white placeholder-gray-500 focus:outline-none ${
                    emailFocused 
                      ? 'border-[#66E6FF] shadow-[0_0_20px_rgba(102,230,255,0.2)]' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className={`block text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${
                passwordFocused ? 'text-[#66E6FF]' : 'text-gray-400'
              }`}>
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`w-full pl-12 pr-12 py-4 rounded-xl bg-black/30 border transition-all text-white placeholder-gray-500 focus:outline-none ${
                    passwordFocused 
                      ? 'border-[#66E6FF] shadow-[0_0_20px_rgba(102,230,255,0.2)]' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {!isLogin && password.length > 0 && passwordStrength && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Password Strength</span>
                    <span className={`font-semibold ${
                      passwordStrength.strength === 1 ? 'text-red-400' :
                      passwordStrength.strength === 2 ? 'text-yellow-400' :
                      passwordStrength.strength === 3 ? 'text-blue-400' :
                      'text-green-400'
                    }`}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#66E6FF] to-[#5AC8DE] hover:from-[#5AC8DE] hover:to-[#66E6FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#070A12] font-bold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(102,230,255,0.3)] hover:shadow-[0_0_40px_rgba(102,230,255,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#070A12]/30 border-t-[#070A12] rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Enter Orbit' : 'Create Account'}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-400">
              {isLogin ? "New to Orbit?" : "Already have an account?"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); setPassword(''); }}
                className="ml-2 text-[#66E6FF] hover:text-[#5AC8DE] font-semibold transition-colors"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Powered by Eburon Technology</p>
          <p className="mt-1">Secure • Private • Borderless</p>
        </div>
      </div>
    </div>
  );
}
