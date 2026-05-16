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
  const { login } = useAuth();
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 active:scale-95 group uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Access Dashboard'}
            {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-[9px] text-center text-slate-400 leading-relaxed uppercase tracking-[0.2em] font-bold">
            Dubai Bazar • Karachi Ops Center<br />
            Secure V2 Connection Active
          </p>
        </div>
      </motion.div>
    </div>
  );
};
