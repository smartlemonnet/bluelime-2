import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { UserPlus, LogIn as LogInIcon } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthMessage from '@/components/auth/AuthMessage';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: '', content: '' });
  const [currentTab, setCurrentTab] = useState('login');
  const { toast } = useToast();

  const clearFieldsAndMessage = () => {
    if (currentTab === 'login') {
      setPassword(''); 
    } else {
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirmPassword('');
    }
    setAuthMessage({ type: '', content: '' });
  };
  
  const handleTabChange = (value) => {
    setCurrentTab(value);
    clearFieldsAndMessage();
  };
  
  const handleResendConfirmation = async () => {
    if (!email) {
      setAuthMessage({ type: 'error', content: "Please enter the email address you registered with." });
      toast({ title: "Missing Email", description: "Please enter your email address to resend the confirmation.", variant: "warning" });
      return;
    }
    setLoading(true);
    setAuthMessage({type: 'info', content: 'Attempting to resend confirmation...'});
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        if(error.message.includes("already confirmed") || error.message.includes("No user found")) {
            setAuthMessage({ type: 'info', content: "This email address is already confirmed or not registered. Try logging in or registering." });
            toast({ title: "Info", description: "Email already confirmed or not found. Try logging in.", variant: "default" });
        } else {
            throw error;
        }
      } else {
        setAuthMessage({ type: 'success', content: "A new confirmation email has been sent. Please check your inbox (and spam folder)." });
        toast({ title: "Confirmation Resent", description: "Please check your email.", variant: "default", duration: 7000 });
      }
    } catch (error) {
      setAuthMessage({ type: 'error', content: `Resend failed: ${error.message}` });
      toast({ title: "Resend Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md bg-slate-800/70 backdrop-blur-lg shadow-2xl rounded-xl p-8 border border-slate-700"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity:0, y: -20}} 
            animate={{ opacity:1, y: 0, transition: {delay: 0.1}}}
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
          >
            Welcome!
          </motion.h1>
          <motion.p 
            initial={{ opacity:0, y: -10}} 
            animate={{ opacity:1, y: 0, transition: {delay: 0.2}}}
            className="text-slate-400 mt-2"
          >
            {currentTab === 'login' ? 'Sign in to your account.' : 'Create a new account.'}
          </motion.p>
        </div>

        <Tabs defaultValue="login" value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border border-slate-600">
            <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <LogInIcon className="w-4 h-4 mr-2" /> Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" /> Register
            </TabsTrigger>
          </TabsList>
          
          <AuthMessage message={authMessage} />

          <TabsContent value="login" key="login">
            <LoginForm 
              setLoading={setLoading}
              setAuthMessage={setAuthMessage}
              loading={loading}
              authMessage={authMessage}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleResendConfirmation={handleResendConfirmation}
            />
          </TabsContent>

          <TabsContent value="register" key="register">
            <RegisterForm
              setLoading={setLoading}
              setAuthMessage={setAuthMessage}
              loading={loading}
              authMessage={authMessage}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              username={username}
              setUsername={setUsername}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handleResendConfirmation={handleResendConfirmation}
            />
          </TabsContent>
        </Tabs>
        
        <motion.div 
            initial={{opacity: 0}} 
            animate={{opacity:1, transition: {delay: 0.5}}} 
            className="mt-8 text-center text-xs text-slate-500"
        >
          By continuing, you agree to our imaginary <a href="#" className="underline hover:text-purple-400">Terms of Service</a> and <a href="#" className="underline hover:text-purple-400">Privacy Policy</a>.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;