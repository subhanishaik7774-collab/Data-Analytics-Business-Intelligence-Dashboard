import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Activity, ArrowRight, ShieldAlert, Check } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, fullName);
        setSuccessMsg('Account created successfully! Logging you in...');
      } else {
        await login(email, password);
        setSuccessMsg('Access approved! Welcome back.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill and quick login with Demo Credentials
  const handleQuickDemoLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await login('demo@bidashboard.com', 'password123');
      setSuccessMsg('Authenticated! Launching BI INSIGHT...');
    } catch (err) {
      setErrorMsg('Demo authentication failed. Server is unresponsive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex items-center justify-center p-6 overflow-hidden">
      {/* Ambient background glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-radial-gradient rounded-full bg-indigo-500/10 filter blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-radial-gradient rounded-full bg-emerald-500/5 filter blur-[120px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-glass shadow-indigo-500/5 relative overflow-hidden">
        {/* Glow accent lines */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-pulse-subtle" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-gradient-to-tr from-brand-primary to-brand-secondary p-3 rounded-2xl shadow-glass-glow flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            BI INSIGHT Dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 max-w-[280px]">
            {isRegister 
              ? 'Establish your administrator profile to begin monitoring business metrics.' 
              : 'Sign in to access custom analytics, KPI tracking, and metric reports.'}
          </p>
        </div>

        {/* Success / Error Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger flex items-start gap-3 text-xs font-semibold animate-fade">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-brand-accent/15 border border-brand-accent/25 text-brand-accent flex items-start gap-3 text-xs font-semibold animate-fade">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="alex@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-glass-glow text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Processing Session...' : isRegister ? 'Establish Account' : 'Authenticate Console'}</span>
            {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-white/10" />
          <span className="relative px-3 bg-[#0f172a] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Alternative Access
          </span>
        </div>

        {/* Demo Fast Access Button */}
        <button
          onClick={handleQuickDemoLogin}
          disabled={loading}
          className="w-full bg-emerald-500/10 border border-emerald-500/25 text-brand-accent hover:bg-emerald-500/20 py-3 px-4 rounded-xl text-xs font-bold transition-all"
        >
          ⚡ Quick Login with Demo Account
        </button>

        {/* Toggle Mode */}
        <div className="mt-8 text-center text-xs">
          <span className="text-gray-400">
            {isRegister ? 'Already registered on BI Insight?' : 'Need administrator credentials?'}
          </span>{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-brand-primary hover:underline font-bold transition-all"
          >
            {isRegister ? 'Login Instead' : 'Register Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
