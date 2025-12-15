import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const createMeeting = () => {
    const newMeetingId = crypto.randomUUID();
    navigate(`/meeting/${newMeetingId}`);
  };

  const joinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      navigate(`/meeting/${joinId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#8A7CFF] rounded-full blur-[150px] opacity-[0.1]"></div>
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#66E6FF] rounded-full blur-[150px] opacity-[0.1]"></div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#66E6FF] to-[#8A7CFF]"></div>
          <h1 className="text-xl font-bold tracking-wider font-mono">ORBIT</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Connect in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66E6FF] to-[#8A7CFF]">Any Orbit</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl text-lg">
          Seamless, AI-translated meetings for everyone, everywhere. 
          Language barriers are a thing of the past.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* New Meeting Card */}
          <button 
            onClick={createMeeting}
            className="group relative p-8 rounded-2xl bg-[#0B1630]/50 border border-white/10 hover:border-[#66E6FF]/50 transition-all hover:shadow-[0_0_30px_rgba(102,230,255,0.15)] text-left flex flex-col gap-4 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#66E6FF] to-[#8A7CFF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-[#66E6FF]/20 flex items-center justify-center text-[#66E6FF]">
              <span className="material-symbols-outlined text-3xl">videocam_off</span> {/* using videocam as generic icon */}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#66E6FF] transition-colors">New Meeting</h3>
              <p className="text-gray-400">Start an instant meeting and invite others to join.</p>
            </div>
          </button>

          {/* Join Meeting Card */}
          <div className="relative p-8 rounded-2xl bg-[#0B1630]/50 border border-white/10 text-left flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8A7CFF]/20 flex items-center justify-center text-[#8A7CFF]">
               <span className="material-symbols-outlined text-3xl">link</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Join Meeting</h3>
              <p className="text-gray-400 mb-6">Enter a meeting code to join an existing session.</p>
              
              <form onSubmit={joinMeeting} className="flex gap-2">
                <input 
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Meeting ID (e.g. abc-123)"
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:border-[#8A7CFF] focus:outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!joinId.trim()}
                  className="px-6 py-3 bg-[#8A7CFF] hover:bg-[#7B6CE6] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Schedule Mockup */}
        <div className="mt-12 w-full max-w-4xl p-8 rounded-2xl bg-[#0B1630]/30 border border-white/5 opacity-75">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">calendar_today</span>
            Upcoming Meetings
          </h3>
          <div className="space-y-3">
             <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
                <div>
                   <h4 className="font-medium">Weekly Sync</h4>
                   <p className="text-sm text-gray-400">Tomorrow, 10:00 AM</p>
                </div>
                <button className="text-sm text-[#66E6FF] hover:underline">Start</button>
             </div>
             <p className="text-sm text-gray-500 italic mt-4">Feature coming soon...</p>
          </div>
        </div>

      </main>
    </div>
  );
}
