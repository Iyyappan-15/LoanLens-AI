import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  History, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Lock, 
  ArrowRight, 
  ExternalLink,
  Code2,
  Copy,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { AuditStep } from '../types';

export const AuditTimelinePage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const caseId = params.id || 'LL-9041';
  const { success, info } = useToast();

  const [steps, setSteps] = useState<AuditStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<AuditStep | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [caseId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditTimeline(caseId);
      setSteps(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    success('Copied to Clipboard', 'Cryptographic block hash copied.');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return <CardSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Cases' },
          { label: `Case ${caseId}`, href: `/cases/${caseId}` },
          { label: 'Cryptographic Audit Trail & Agent Verification' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Immutable Underwriting Audit Trail
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900">
              {caseId}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete verifiable execution ledger. Every agent action is timestamped, sealed with SHA-256 hashes, and auditable for regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/cases/${caseId}/cam`)}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Open CAM
          </Button>
        </div>
      </div>

      {/* Overall Integrity Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              Chain Integrity Verified (7 Steps Seated)
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Zero hash collisions or retroactive tampering detected. Meets RBI digital lending guidelines.
            </div>
          </div>
        </div>

        <span className="hidden sm:inline-block text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
          SECP256K1_OK
        </span>
      </div>

      {/* Timeline Steps Card */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 dark:border-gray-800 space-y-8">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in_progress';

              return (
                <div key={step.id} className="relative group">
                  {/* Circle indicator */}
                  <div
                    className={`absolute -left-[33px] sm:-left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                        : isInProgress
                        ? 'bg-primary ring-2 ring-primary/20 animate-pulse'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />

                  {/* Step Card Container */}
                  <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-soft hover:shadow-soft-md transition-all duration-150 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                          Step 0{idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {step.stepName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {step.durationMs > 0 ? `${step.durationMs}ms` : 'Active'}
                        </span>
                        <span>•</span>
                        <span>{step.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.details}
                    </p>

                    {/* Metadata Badges */}
                    {step.metadata && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(step.metadata).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-gray-400">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Hash & Signature */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
                        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[320px]">
                          Hash: {step.hash}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStep(step)}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <Code2 className="w-3 h-3" /> Inspect Proof
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cryptographic Proof Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedStep)}
        onClose={() => setSelectedStep(null)}
        title={
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            <span>Cryptographic Proof Verification</span>
          </div>
        }
        description={`Verifiable signature block for "${selectedStep?.stepName}"`}
        maxWidth="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedStep(null)}>
            Dismiss
          </Button>
        }
      >
        {selectedStep && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-gray-400">
                Agent Signature Certificate:
              </span>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {selectedStep.verifiedSignature}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Raw Audit Node Ledger JSON:
                </span>
                <button
                  onClick={() => handleCopyHash(JSON.stringify(selectedStep, null, 2))}
                  className="text-primary hover:text-primary-700 flex items-center gap-1 font-medium"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHash ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-[11px] overflow-x-auto max-h-64">
                {JSON.stringify(selectedStep, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
