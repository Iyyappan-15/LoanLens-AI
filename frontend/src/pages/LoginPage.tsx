import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Layers, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'v.roy@mercurylending.ai',
      password: '••••••••••••',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      await api.login(data.email, data.password);
      success('Authentication Successful', 'Welcome back to LoanLens Underwriting Portal');
      navigate('/');
    } catch (err: any) {
      error('Authentication Failed', err.message || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setValue('email', 'v.roy@mercurylending.ai');
    setValue('password', 'BankDemo2026!');
    onSubmit({
      email: 'v.roy@mercurylending.ai',
      password: 'BankDemo2026!',
      rememberMe: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B0F19] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Fintech Brand Graphic & Illustration */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-soft">
            <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Enterprise MSME Credit Platform
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Precision MSME Underwriting with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                LoanLens AI
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Accelerate commercial loan decisions from days to minutes. Multi-agent OCR, automated GST
              reconciliation, circular trading fraud detection, and instant CAM generation.
            </p>
          </div>

          {/* Interactive Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { title: 'Autonomous Agents', desc: 'Cash Flow, GST & Fraud verification' },
              { title: 'Explainable CAM', desc: 'Audited Credit Assessment Memorandum' },
              { title: 'Sub-minute OCR', desc: '100+ pages of bank statements parsed' },
              { title: 'RBI PSL Aligned', desc: 'Compliant MSME underwriting policies' },
            ].map((f, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-100 dark:border-gray-800 shadow-soft flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{f.title}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Trust Quote */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
            <span>
              Trusted by commercial banks, NBFCs, and digital lenders servicing over ₹12,500 Cr in MSME working capital.
            </span>
          </div>
        </div>

        {/* Right Col: Modern Glassmorphic Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-gray-200/80 dark:border-gray-800 p-8 sm:p-10 relative">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Underwriter Portal
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <ShieldCheck className="w-3 h-3" /> 256-bit Encrypted
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your banking credentials to access assigned MSME files.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Bank Email Address"
                type="email"
                placeholder="underwriter@bank.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid work email',
                  },
                })}
              />

              <Input
                label="Access Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300 select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    {...register('rememberMe')}
                  />
                  <span>Remember this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-primary hover:text-primary-700 dark:hover:text-primary-400 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Authenticate & Access Dashboard
              </Button>
            </form>

            {/* Quick Demo Access Divider */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Need to evaluate the frontend immediately?
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickDemo}
                className="w-full border-blue-200 dark:border-blue-900/60 text-primary dark:text-primary-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-accent" />}
              >
                1-Click Quick Demo Login (Vikramaditya Roy)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        title="Reset Underwriter Password"
        description="Enter your corporate bank email to receive an enterprise multi-factor reset link."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!forgotEmail) {
                  error('Error', 'Please enter your corporate email address');
                  return;
                }
                success('Reset Link Dispatched', `Instructions sent to ${forgotEmail}`);
                setIsForgotPasswordOpen(false);
              }}
            >
              Send Reset Link
            </Button>
          </>
        }
      >
        <div className="py-2">
          <Input
            label="Corporate Email"
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            placeholder="v.roy@mercurylending.ai"
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>
      </Modal>
    </div>
  );
};
