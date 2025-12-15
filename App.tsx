import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/pages/AuthPage';
import Dashboard from './components/pages/Dashboard';
import MeetingPage from './components/pages/MeetingPage';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Or a loading spinner

  return (
    <Router>
      <div className="App">
         {/* Background can be global or per page. We'll leave it in pages for specific tuning */}
        <Routes>
          <Route 
            path="/auth" 
            element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={session ? <Dashboard /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/meeting/:meetingId" 
            element={session ? <MeetingPage /> : <Navigate to="/auth" />} 
          />
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/auth"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;