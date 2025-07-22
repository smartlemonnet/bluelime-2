import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Send } from 'lucide-react';

const inputGroupVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const RegisterForm = ({ 
  setLoading, 
  setAuthMessage, 
  loading, 
  authMessage, 
  email, setEmail, 
  password, setPassword, 
  username, setUsername, 
  confirmPassword, setConfirmPassword,
  handleResendConfirmation 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setAuthMessage({ type: 'error', content: "Username is required." });
      toast({ title: "Registration Failed", description: "Username is required.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      setAuthMessage({ type: 'error', content: "Password should be at least 6 characters." });
      toast({ title: "Registration Failed", description: "Password should be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      setAuthMessage({ type: 'error', content: "Passwords do not match." });
      toast({ title: "Registration Failed", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setAuthMessage({ type: '', content: '' });

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            username: username.trim(),
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered") || (error.code && error.code === "user_already_exists")) {
          setAuthMessage({ 
            type: 'info', 
            content: "This email is already registered. If you haven't confirmed it, check your inbox (and spam) for the confirmation link. Otherwise, please log in."
          });
           toast({ title: "Already Registered", description: "This email is already in use. Try logging in or check email confirmation.", variant: "warning", duration: 8000 });
        } else {
          throw error;
        }
      } else if (data.user) {
        if (data.user.identities && data.user.identities.length === 0 && !data.user.email_confirmed_at) {
           setAuthMessage({ 
            type: 'info', 
            content: "This email is already registered but not confirmed. We've sent another confirmation link. Please check your inbox (and spam folder)."
          });
          toast({ 
            title: "Confirmation Sent", 
            description: "Please check your email (and spam) to confirm your account.", 
            variant: "default",
            duration: 10000 
          });
        } else {
           setAuthMessage({ 
            type: 'success', 
            content: "Registration successful! Please check your email inbox (and spam folder) for a confirmation link to activate your account."
          });
          toast({ 
            title: "Registration Successful!", 
            description: "A confirmation email has been sent. Please check your inbox (and spam folder).", 
            variant: "default",
            duration: 10000 
          });
          setEmail(''); 
          setPassword('');
          setConfirmPassword('');
          setUsername('');
        }
      }

    } catch (error) {
      setAuthMessage({ type: 'error', content: error.message });
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleRegister} 
      className="space-y-4 mt-6"
      variants={inputGroupVariants}
      initial="initial"
      animate="animate"
      exit={{opacity:0, x: 20}}
    >
      <motion.div variants={itemVariants} className="relative">
        <Label htmlFor="username-register" className="text-slate-300">Username</Label>
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-slate-400" />
        <Input
          id="username-register"
          type="text"
          placeholder="Choose a cool username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Label htmlFor="email-register" className="text-slate-300">Email</Label>
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-slate-400" />
        <Input
          id="email-register"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500"
        />
      </motion.div>
      <motion.div variants={itemVariants} className="relative">
        <Label htmlFor="password-register" className="text-slate-300">Password (min. 6 characters)</Label>
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-slate-400" />
        <Input
          id="password-register"
          type={showPassword ? "text" : "password"}
          placeholder="Create a strong password"
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
      <motion.div variants={itemVariants} className="relative">
        <Label htmlFor="confirm-password-register" className="text-slate-300">Confirm Password</Label>
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-slate-400" />
        <Input
          id="confirm-password-register"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="pl-10 pr-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-slate-400 hover:text-slate-200"
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </motion.div>
      <motion.div variants={itemVariants} className="pt-2">
        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg" disabled={loading}>
          {loading ? 'Registering...' : 'Create Account'}
        </Button>
      </motion.div>
      {(authMessage.type === 'info' && (authMessage.content.includes("already registered but not confirmed") || authMessage.content.includes("This email is already registered. If you haven't confirmed"))) && (
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

export default RegisterForm;