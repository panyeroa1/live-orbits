import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        // Auto sign in or show message
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      {/* Background blobs reusing existing CSS classes if possible, or inline style for cleanliness in new component */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#070A12]">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#66E6FF] rounded-full blur-[120px] opacity-[0.15]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#8A7CFF] rounded-full blur-[120px] opacity-[0.15]"></div>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0B1630]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-white font-mono tracking-widest">
          ORBIT <span className="text-[#66E6FF]">AUTH</span>
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-[#66E6FF] focus:outline-none transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-[#66E6FF] focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#66E6FF] hover:bg-[#5AC8DE] disabled:opacity-50 disabled:cursor-not-allowed text-[#070A12] font-semibold rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(102,230,255,0.3)]"
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter Orbit' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
