import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

import { Logo } from '../components/layout/Logo';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(password);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/admin');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    setError('');
    const success = await loginWithGoogle();
    setIsGoogleSubmitting(false);
    if (success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-slate-200"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" className="mb-6" showText={false} />
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admin Terminal</h1>
          <p className="text-orange-600 text-[10px] mt-1 uppercase tracking-[0.2em] font-black">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-slate-900 tracking-[0.3em] text-center"
              autoFocus
              disabled={isSubmitting || isGoogleSubmitting}
            />
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest">
                <ShieldAlert size={14} />
                {error}
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg active:scale-95 group uppercase tracking-widest disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Authenticating...' : 'Access with Key'}
            {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 active:scale-95 uppercase tracking-widest disabled:opacity-50 cursor-pointer"
        >
          {isGoogleSubmitting ? 'Connecting...' : 'Sign In with Google'}
          {!isGoogleSubmitting && (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.43 13c0-3.037 2.477-5.514 5.56-5.514 1.358 0 2.597.483 3.57 1.285l3.12-3.12A9.457 9.457 0 0 0 13.99 3c-5.244 0-9.49 4.246-9.49 9.49s4.246 9.49 9.49 9.49c5.244 0 9.17-3.684 9.17-9.317 0-.583-.05-1.127-.156-1.638H12.24z"/>
            </svg>
          )}
        </button>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-[9px] text-center text-slate-400 leading-relaxed uppercase tracking-[0.2em] font-bold">
            Dubai Bazar • Karachi Ops Center<br />
            Secure Google V2 Identity Protocol
          </p>
        </div>
      </motion.div>
    </div>
  );
};
