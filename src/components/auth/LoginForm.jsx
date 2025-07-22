import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Send } from 'lucide-react';

const inputGroupVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const LoginForm = ({ setLoading, setAuthMessage, loading, authMessage, email, setEmail, password, setPassword, handleResendConfirmation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: '', content: '' });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.user && !data.user.email_confirmed_at) {
         setAuthMessage({ 
          type: 'info', 
          content: "Please confirm your email address before logging in. Check your inbox (and spam folder) for the confirmation link."
        });
        toast({ 
          title: "Email Not Confirmed", 
          description: "Please check your email for the confirmation link.", 
          variant: "warning",
          duration: 7000
        });
        await supabase.auth.signOut();
        return;
      }

      toast({ title: "Login Successful!", description: "Welcome back! Redirecting...", variant: "default" });
      navigate('/');
    } catch (error) {
      setAuthMessage({ type: 'error', content: error.message });
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleLogin} 
      className="space-y-6 mt-6"
      variants={inputGroupVariants}
      initial="initial"
      animate="animate"
      exit={{opacity:0, x: 20}}
    >
      <motion.div variants={itemVariants} className="relative">
        <Label htmlFor="email-login" className="text-slate-300">Email</Label>
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-slate-400" />
        <Input
          id="email-login"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500"
        />
      </motion.div>
      <motion.div variants={itemVariants} className="relative">
        <Label htmlFor="password-login" className="text-slate-300">Password</Label>
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-slate-400" />
        <Input
          id="password-login"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="pl-10 pr-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-slate-400 hover:text-slate-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </motion.div>
      {(authMessage.type === 'info' && authMessage.content.includes("confirm your email")) && (
          <motion.div variants={itemVariants} className="mt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  className="w-full border-sky-500 text-sky-300 hover:bg-sky-600/50 hover:text-sky-100"
                  onClick={handleResendConfirmation}
                  disabled={loading || !email}
              >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Resend Confirmation Email'}
              </Button>
          </motion.div>
      )}
    </motion.form>
  );
};

export default LoginForm;