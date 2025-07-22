import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Builder from '@/components/landing-page-builder/Builder';
import PreviewPage from '@/components/landing-page-builder/PreviewPage';
import ThankYouPage from '@/components/landing-page-builder/ThankYouPage';
import AuthPage from '@/components/auth/AuthPage'; 
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = (event, currentSession) => {
      console.log('Auth event:', event, 'Session:', currentSession);

      if (event === 'SIGNED_OUT') {
        setSession(null);
        navigate('/auth', { replace: true });
      } else if (event === 'TOKEN_REFRESHED' && !currentSession) {
        // This handles the "Invalid Refresh Token" case.
        // Supabase tried to refresh, failed, and cleared the session.
        console.warn('Refresh token invalid. Forcing logout.');
        setSession(null);
        navigate('/auth', { replace: true });
      } else {
        setSession(currentSession);
      }
      setLoadingAuth(false);
    };

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoadingAuth(false);

      if (!currentSession && !location.pathname.startsWith('/p/') && !location.pathname.startsWith('/preview/') && location.pathname !== '/auth') {
        navigate('/auth', { replace: true });
      } else if (currentSession && location.pathname === '/auth') {
        navigate('/', { replace: true });
      }
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      handleAuthChange(event, currentSession);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]);
  
  // This effect handles navigation logic AFTER the session state has been updated.
  useEffect(() => {
    if (!loadingAuth) {
      if (!session && !location.pathname.startsWith('/p/') && !location.pathname.startsWith('/preview/') && location.pathname !== '/auth' && location.pathname !== '/thank-you') {
        navigate('/auth', { replace: true });
      } else if (session && location.pathname === '/auth') {
        navigate('/', { replace: true });
      }
    }
  }, [session, loadingAuth, location.pathname, navigate]);


  if (loadingAuth) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[10000]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full"
        />
        <p className="mt-6 text-xl text-slate-200 font-semibold">Initializing App...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/" 
          element={
            session ? <Builder key={session.user.id} session={session} /> : <AuthRedirector currentPath={location.pathname} />
          } 
        />
        <Route path="/p/:slug" element={<PreviewPage isPublic={true} />} />
        <Route path="/preview/:id" element={<PreviewPage isPublic={false} />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

const AuthRedirector = ({ currentPath }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (currentPath !== '/auth' && !currentPath.startsWith('/p/') && !currentPath.startsWith('/preview/') && currentPath !== '/thank-you') {
      navigate('/auth', { replace: true });
    }
  }, [navigate, currentPath]);
  
  return ( 
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[10000]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-t-sky-500 border-r-sky-500 border-b-transparent border-l-transparent rounded-full"
      />
      <p className="mt-4 text-lg text-slate-300">Redirecting to login...</p>
    </div>
  );
};

export default App;