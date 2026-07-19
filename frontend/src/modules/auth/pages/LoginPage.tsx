'use client';

import * as React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Building2, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'session_expired') {
        toast.error('Your session has expired. Please sign in again to continue.', {
          icon: '🔒',
          duration: 5000,
        });
        
        // Optionally clean up the URL without a reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Left panel - Branding / Visuals */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-900">
        {/* Modern Mesh/Gradient Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-blue-900 opacity-90 z-0" />
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-3xl z-0" />
        <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-3xl z-0" />
        
        {/* Header */}
        <div className="relative z-20 flex items-center text-2xl font-bold text-white tracking-tight">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm mr-3 border border-white/10 shadow-xl">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          Smatal HR
        </div>

        {/* Floating Feature Cards (Glassmorphism) */}
        <div className="relative z-20 flex flex-col gap-6 mt-12 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl transform transition-transform hover:scale-105 duration-300">
            <Users className="h-8 w-8 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Unified Workforce</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Manage employees, candidates, and onboarding flows in one seamlessly integrated enterprise platform.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl ml-8 transform transition-transform hover:scale-105 duration-300">
            <ShieldCheck className="h-8 w-8 text-emerald-200 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              Built with role-based access control and advanced security protocols to keep your data safe.
            </p>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-20 mt-auto pt-12">
          <blockquote className="space-y-3">
            <p className="text-xl font-medium leading-relaxed text-white/90">
              &quot;This unified enterprise platform has completely transformed how we manage our human resources and organizational structures.&quot;
            </p>
            <footer className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 border-2 border-white/30" />
              <div>
                <p className="text-sm font-semibold text-white">Sofia Davis</p>
                <p className="text-xs text-white/70">VP of Human Resources</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md relative">
          
          <div className="relative z-10 flex flex-col space-y-3 mb-8">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Smatal HR</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your credentials to securely access your account.
            </p>
          </div>
          
          <div className="relative z-10">
            <LoginForm />
          </div>
          
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              By clicking continue, you agree to our{' '}
              <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
