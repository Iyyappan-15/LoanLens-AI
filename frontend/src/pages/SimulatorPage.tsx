import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Percent, 
  Sparkles,
  Calculator,
  RotateCcw,
  CheckCircle2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge, RecommendationBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { api } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const SimulatorPage: React.FC = () => {
  // Input parameters
  const [monthlyIncome, setMonthlyIncome] = useState<number>(4000000); // 40 Lakhs / month
  const [monthlyExpense, setMonthlyExpense] = useState<number>(2900000); // 29 Lakhs / month
  const [requestedLoan, setRequestedLoan] = useState<number>(7500000); // 75 Lakhs
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(36); // 36 months
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(11.25); // 11.25%
  const [existingEmi, setExistingEmi] = useState<number>(185000); // 1.85 Lakhs

  const handleResetDefaults = () => {
    setMonthlyIncome(4000000);
    setMonthlyExpense(2900000);
    setRequestedLoan(7500000);
    setLoanTenureMonths(36);
    setAnnualInterestRate(11.25);
    setExistingEmi(185000);
  };

  // Run simulation calculation
  const simulation = useMemo(() => {
    return api.runSimulation({
      monthlyIncome,
      monthlyExpense,
      requestedLoan,
      loanTenureMonths,
      annualInterestRate,
      existingEmi,
    });
  }, [monthlyIncome, monthlyExpense, requestedLoan, loanTenureMonths, annualInterestRate, existingEmi]);

  // Pie chart data: Principal vs Interest
  const repaymentChartData = [
    { name: 'Principal Loan Amount', value: requestedLoan, color: '#1E88E5' },
    { name: 'Total Interest Payable', value: simulation.totalInterest, color: '#FF3D00' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Underwriting Tools' },
          { label: 'What-if Credit Simulator' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            What-if Credit & FOIR Simulator
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Dynamically adjust borrower income, facility quantum, tenure, and interest rates to preview instant policy outcomes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetDefaults}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset to Benchmark
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Borrower Financials & Facility Parameters</CardTitle>
                <CardDescription>Adjust inputs to test debt capacity</CardDescription>
              </div>
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> Instant Engine
              </span>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Slider 1: Requested Loan Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Requested Loan Amount:
                  </label>
                  <span className="font-mono font-bold text-primary text-sm">
                    {formatCurrency(requestedLoan)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={25000000}
                  step={250000}
                  value={requestedLoan}
                  onChange={e => setRequestedLoan(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>₹5 Lakhs</span>
                  <span>₹1.25 Cr</span>
                  <span>₹2.50 Cr</span>
                </div>
              </div>

              {/* Slider 2: Monthly Business Inflows / Income */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Monthly Operating Turnover / Inflows:
                  </label>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                    {formatCurrency(monthlyIncome)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={15000000}
                  step={100000}
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>₹5 Lakhs / mo</span>
                  <span>₹75 Lakhs / mo</span>
                  <span>₹1.50 Cr / mo</span>
                </div>
              </div>

              {/* Slider 3: Monthly Expenses */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Monthly Operating Expenses:
                  </label>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                    {formatCurrency(monthlyExpense)}
                  </span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={12000000}
                  step={100000}
                  value={monthlyExpense}
                  onChange={e => setMonthlyExpense(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>₹2 Lakhs / mo</span>
                  <span>₹60 Lakhs / mo</span>
                  <span>₹1.20 Cr / mo</span>
                </div>
              </div>

              {/* 3-Column Inputs: Tenure, Rate, Existing EMI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={loanTenureMonths}
                    onChange={e => setLoanTenureMonths(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <option value={12}>12 Months (1 yr)</option>
                    <option value={24}>24 Months (2 yrs)</option>
                    <option value={36}>36 Months (3 yrs)</option>
                    <option value={48}>48 Months (4 yrs)</option>
                    <option value={60}>60 Months (5 yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="8"
                    max="22"
                    value={annualInterestRate}
                    onChange={e => setAnnualInterestRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Existing Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    value={existingEmi}
                    onChange={e => setExistingEmi(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Repayment Capital Breakdown</CardTitle>
                <CardDescription>Principal vs Total Interest Paid</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repaymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {repaymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Real-time Outcomes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-t-4 border-t-primary shadow-soft-md">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <div>
                <CardTitle>Real-Time Underwriting Assessment</CardTitle>
                <CardDescription>Computed instantly from bank policy parameters</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              {/* Verdict Header Pill */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Policy Assessment
                  </span>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                    {simulation.policyResult}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RiskBadge risk={simulation.riskCategory} />
                  <RecommendationBadge recommendation={simulation.recommendation} />
                </div>
              </div>

              {/* Key Ratio 1: FOIR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    FOIR (Fixed Obligation to Income Ratio):
                  </span>
                  <span className={`font-mono font-bold text-sm ${simulation.foir > 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {simulation.foir}%
                  </span>
                </div>
                <ProgressBar
                  value={simulation.foir}
                  max={100}
                  color={simulation.foir > 60 ? 'alert' : simulation.foir > 45 ? 'warning' : 'success'}
                  size="sm"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Healthy &lt; 40%</span>
                  <span>Threshold: 55%</span>
                  <span>Excessive &gt; 65%</span>
                </div>
              </div>

              {/* Key Ratio 2: Free Cash Flow & Monthly EMI */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Proposed EMI</span>
                  <div className="text-base font-bold text-primary mt-0.5">
                    {formatCurrency(simulation.monthlyEmi)}
                  </div>
                  <span className="text-[10px] text-gray-500">Per month</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Free Cash Flow</span>
                  <div className={`text-base font-bold mt-0.5 ${simulation.freeCashFlow < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(simulation.freeCashFlow)}
                  </div>
                  <span className="text-[10px] text-gray-500">After all obligations</span>
                </div>
              </div>

              {/* DSCR & Max Affordable Loan */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">DSCR Debt Coverage:</span>
                  <span className={`font-mono font-bold ${simulation.dscr < 1.25 ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>
                    {simulation.dscr}x {simulation.dscr >= 1.25 ? '(Pass)' : '(Fail)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Interest Payable:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {formatCurrency(simulation.totalInterest)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Repayment Over Tenure:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {formatCurrency(simulation.totalRepayment)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-500">Max Recommended Facility:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(simulation.maxAffordableLoan)}
                  </span>
                </div>
              </div>

              {/* Policy Engine Feedback Notes */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Policy Insights
                </span>
                {simulation.policyNotes.map((note, idx) => (
                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
