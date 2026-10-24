import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Building, 
  Coins, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { BusinessType } from '../types';

interface NewCaseFormData {
  // Step 1: Applicant
  fullName: string;
  email: string;
  phone: string;
  pan: string;
  aadhaar: string;
  cibilScore: number;
  experienceYears: number;
  personalAddress: string;

  // Step 2: Business
  legalName: string;
  tradeName: string;
  businessType: BusinessType;
  gstin: string;
  industry: string;
  vintageYears: number;
  annualTurnover: number;
  employeeCount: number;
  businessAddress: string;

  // Step 3: Loan Request
  amount: number;
  tenureMonths: number;
  purpose: string;
  interestRateExpected: number;
  collateralOffered: string;
  collateralValue: number;
}

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<NewCaseFormData>({
    mode: 'onBlur',
    defaultValues: {
      fullName: 'Kavita Sundaram',
      email: 'kavita@sundaramprecision.com',
      phone: '+91 98401 22890',
      pan: 'AAAPS4410K',
      aadhaar: 'XXXX-XXXX-7721',
      cibilScore: 765,
      experienceYears: 11,
      personalAddress: 'B-402, Green Glen Layout, Bellandur, Bengaluru 560103',

      legalName: 'Sundaram Advanced Tools & Dies Pvt Ltd',
      tradeName: 'Sundaram Tooling',
      businessType: 'Private Limited',
      gstin: '29AAACS4410K1ZZ',
      industry: 'Auto Components & Die Casting',
      vintageYears: 6,
      annualTurnover: 42000000,
      employeeCount: 34,
      businessAddress: 'Plot 18, Bommasandra Industrial Area Phase 1, Bengaluru 560099',

      amount: 6500000,
      tenureMonths: 36,
      purpose: 'Procurement of High-Precision EDM Wire Cut Machine for defense tier-2 contracts',
      interestRateExpected: 11.2,
      collateralOffered: 'Industrial Unit Bommasandra + Machine Hypothecation',
      collateralValue: 10500000,
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof NewCaseFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'phone', 'pan', 'cibilScore'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['legalName', 'gstin', 'industry', 'vintageYears', 'annualTurnover'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => (prev < 3 ? ((prev + 1) as any) : prev));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSaveDraft = () => {
    const currentValues = getValues();
    localStorage.setItem('loanlens_case_draft', JSON.stringify(currentValues));
    info('Draft Saved', 'Application draft stored in offline cache.');
  };

  const onSubmit = async (data: NewCaseFormData) => {
    setIsSubmitting(true);
    try {
      const created = await api.createCase({
        applicant: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          pan: data.pan,
          aadhaar: data.aadhaar,
          address: data.personalAddress,
          cibilScore: Number(data.cibilScore),
          experienceYears: Number(data.experienceYears),
        },
        business: {
          legalName: data.legalName,
          tradeName: data.tradeName || data.legalName,
          businessType: data.businessType,
          gstin: data.gstin,
          industry: data.industry,
          vintageYears: Number(data.vintageYears),
          registeredAddress: data.businessAddress,
          annualTurnover: Number(data.annualTurnover),
          employeeCount: Number(data.employeeCount),
        },
        loanRequest: {
          amount: Number(data.amount),
          tenureMonths: Number(data.tenureMonths),
          purpose: data.purpose,
          interestRateExpected: Number(data.interestRateExpected),
          collateralOffered: data.collateralOffered,
          collateralValue: Number(data.collateralValue),
        },
      });

      success('Loan Case Ingested', `Case ${created.id} initiated. Multi-agent OCR active.`);
      navigate(`/cases/${created.id}/documents`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Applicant Details', desc: 'Promoter KYC & Bureau', icon: User },
    { num: 2, title: 'Business Details', desc: 'GST, Vintage & Industry', icon: Building },
    { num: 3, title: 'Requested Loan', desc: 'Facility, Tenure & Collateral', icon: Coins },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Cases' },
          { label: 'New Loan Case Application' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Intake New MSME Loan Case
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Provide promoter and commercial entity data to initiate autonomous underwriting pipeline.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Draft
        </Button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map(step => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const Icon = step.icon;

          return (
            <div
              key={step.num}
              onClick={() => {
                if (step.num < currentStep) setCurrentStep(step.num as any);
              }}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-primary text-primary shadow-sm'
                  : isCompleted
                  ? 'bg-white dark:bg-gray-900 border-emerald-300 dark:border-emerald-800 text-emerald-600'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-primary text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {step.title}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{step.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                Step {currentStep} of 3: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>{steps[currentStep - 1].desc}</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <ShieldCheck className="w-4 h-4" /> Real-time Validation
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Applicant Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Promoter Full Name *"
                    placeholder="e.g. Rajesh Kumar Singhania"
                    error={errors.fullName?.message}
                    {...register('fullName', { required: 'Promoter name is required' })}
                  />

                  <Input
                    label="Corporate Email Address *"
                    type="email"
                    placeholder="e.g. rajesh@apexprecision.in"
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Phone Number *"
                    placeholder="+91 98201 44590"
                    error={errors.phone?.message}
                    {...register('phone', { required: 'Phone number is required' })}
                  />

                  <Input
                    label="Promoter PAN *"
                    placeholder="ABCPS4521M"
                    className="uppercase"
                    error={errors.pan?.message}
                    {...register('pan', {
                      required: 'PAN is required',
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: 'Invalid 10-digit PAN format' },
                    })}
                  />

                  <Input
                    label="Aadhaar Reference"
                    placeholder="XXXX-XXXX-8912"
                    {...register('aadhaar')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Self-Reported CIBIL Score *"
                    type="number"
                    placeholder="750"
                    helperText="Bureau check will auto-verify this score"
                    error={errors.cibilScore?.message}
                    {...register('cibilScore', {
                      required: 'CIBIL is required',
                      min: { value: 300, message: 'Min 300' },
                      max: { value: 900, message: 'Max 900' },
                    })}
                  />

                  <Input
                    label="Promoter Industry Experience (Years)"
                    type="number"
                    placeholder="8"
                    {...register('experienceYears')}
                  />
                </div>

                <Input
                  label="Promoter Residential Address"
                  placeholder="Plot 42, Wagle Estate, Thane West, Maharashtra"
                  {...register('personalAddress')}
                />
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Legal Name *"
                    placeholder="e.g. Apex Precision Engineering Pvt Ltd"
                    error={errors.legalName?.message}
                    {...register('legalName', { required: 'Business name is required' })}
                  />

                  <Input
                    label="Trade / Brand Name"
                    placeholder="e.g. Apex Gears & Tooling"
                    {...register('tradeName')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Constitution Type *"
                    {...register('businessType', { required: true })}
                    options={[
                      { label: 'Private Limited', value: 'Private Limited' },
                      { label: 'Proprietorship', value: 'Proprietorship' },
                      { label: 'Partnership', value: 'Partnership' },
                      { label: 'LLP', value: 'LLP' },
                      { label: 'Public Limited', value: 'Public Limited' },
                    ]}
                  />

                  <Input
                    label="GSTIN *"
                    placeholder="27AABCA1234F1Z8"
                    className="uppercase"
                    error={errors.gstin?.message}
                    {...register('gstin', {
                      required: 'GSTIN is required',
                      pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
                        message: 'Invalid 15-digit GSTIN format',
                      },
                    })}
                  />

                  <Input
                    label="Operating Vintage (Years) *"
                    type="number"
                    placeholder="5"
                    error={errors.vintageYears?.message}
                    {...register('vintageYears', {
                      required: 'Vintage is required',
                      min: { value: 1, message: 'Must be at least 1 year' },
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Industry Sector *"
                    placeholder="e.g. Precision Machining & Auto"
                    error={errors.industry?.message}
                    {...register('industry', { required: 'Industry is required' })}
                  />

                  <Input
                    label="Annual Turnover (₹ INR) *"
                    type="number"
                    placeholder="45000000"
                    helperText="Last audited FY revenue"
                    error={errors.annualTurnover?.message}
                    {...register('annualTurnover', {
                      required: 'Turnover is required',
                      min: { value: 100000, message: 'Min ₹1,00,000' },
                    })}
                  />

                  <Input
                    label="Total Workforce / Employees"
                    type="number"
                    placeholder="35"
                    {...register('employeeCount')}
                  />
                </div>

                <Input
                  label="Registered Factory / Office Address"
                  placeholder="Plot 18, Industrial Area, Sector 5"
                  {...register('businessAddress')}
                />
              </div>
            )}

            {/* Step 3: Requested Loan */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Requested Loan Amount (₹) *"
                    type="number"
                    placeholder="7500000"
                    helperText="e.g. 75,00,000 for ₹75 Lakhs"
                    error={errors.amount?.message}
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 500000, message: 'Minimum loan size is ₹5 Lakhs' },
                    })}
                  />

                  <Input
                    label="Tenure (Months) *"
                    type="number"
                    placeholder="36"
                    error={errors.tenureMonths?.message}
                    {...register('tenureMonths', {
                      required: 'Tenure is required',
                      min: { value: 6, message: 'Min 6 months' },
                      max: { value: 120, message: 'Max 120 months' },
                    })}
                  />

                  <Input
                    label="Expected Interest Rate (% p.a.)"
                    type="number"
                    step="0.25"
                    placeholder="11.5"
                    {...register('interestRateExpected')}
                  />
                </div>

                <Input
                  label="Purpose of Commercial Financing *"
                  placeholder="e.g. Purchase of 5-Axis CNC Milling Machine & raw material inventory"
                  error={errors.purpose?.message}
                  {...register('purpose', { required: 'Purpose is required' })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Collateral / Hypothecation Offered"
                    placeholder="e.g. Industrial shed property + hypothecation of tooling plant"
                    {...register('collateralOffered')}
                  />

                  <Input
                    label="Estimated Collateral Valuation (₹)"
                    type="number"
                    placeholder="12000000"
                    helperText="Valuer inspection will verify LTV"
                    {...register('collateralValue')}
                  />
                </div>

                {/* Pre-submission Summary Box */}
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                    <Sparkles className="w-4 h-4" /> Next Steps After Case Ingestion:
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                    <li>Immediate redirect to 5-point document upload station</li>
                    <li>OCR engine will parse bank statements, GSTR-3B & ITR-6 in parallel</li>
                    <li>Cash Flow & Fraud Detective agents will run autonomous checks</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Step {currentStep - 1}
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                size="sm"
                onClick={nextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                type="submit"
                size="md"
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit Case & Open Document Upload
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
