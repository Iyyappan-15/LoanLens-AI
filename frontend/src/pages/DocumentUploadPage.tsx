import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  ArrowRight,
  FileCheck,
  FileSpreadsheet,
  Building,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { DocumentType, UploadedDocItem } from '../types';

interface DocCardConfig {
  type: DocumentType;
  title: string;
  description: string;
  accepted: string;
  icon: any;
  recommendation: string;
}

const REQUIRED_DOCUMENTS: DocCardConfig[] = [
  {
    type: 'Bank Statement',
    title: '12 Months Bank Statements',
    description: 'Current account statement with e-passbook or digitally signed PDF',
    accepted: '.pdf, .csv, .xlsx',
    icon: FileSpreadsheet,
    recommendation: 'Must cover last 365 days of active business transactions',
  },
  {
    type: 'GST Report',
    title: 'GSTR-3B & GSTR-1 Filings',
    description: 'Monthly returns filed on GST portal with filing acknowledgments',
    accepted: '.pdf, .json',
    icon: FileCheck,
    recommendation: 'Used by Reconciliation Agent to detect turnover variance',
  },
  {
    type: 'Income Tax Return',
    title: 'ITR-5 / ITR-6 with Computation',
    description: 'Last 2 Assessment Years acknowledgment and tax computation sheets',
    accepted: '.pdf',
    icon: FileText,
    recommendation: 'Verifies declared taxable net profit and depreciation schedules',
  },
  {
    type: 'KYC',
    title: 'Promoter KYC & Business Charter',
    description: 'PAN, Aadhaar, MOA, AOA, or Partnership Deed of legal entity',
    accepted: '.pdf, .jpg, .png',
    icon: UserCheck,
    recommendation: 'Cross-checked against MCA-21 and UIDAI registry',
  },
  {
    type: 'Financial Statement',
    title: 'Audited Financial Statements',
    description: 'Balance Sheet, Profit & Loss account with CA notes and UDIN',
    accepted: '.pdf',
    icon: Building,
    recommendation: 'Provides audited ratios, DSCR, and net worth backing',
  },
];

export const DocumentUploadPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const caseId = params.id || 'LL-9041';
  const { success, warning, error } = useToast();

  const [docs, setDocs] = useState<UploadedDocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File Preview Modal
  const [previewDoc, setPreviewDoc] = useState<UploadedDocItem | null>(null);

  useEffect(() => {
    loadDocs();
  }, [caseId]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments(caseId);
      setDocs(data);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (type: DocumentType, file: File) => {
    // Validate file size (< 25MB)
    if (file.size > 25 * 1024 * 1024) {
      error('File Too Large', 'Maximum allowed file size is 25 MB.');
      return;
    }

    setUploadingType(type);
    setUploadProgress(15);

    // Simulate progressive OCR ingestion
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const uploaded = await api.uploadDocument(caseId, type, file);
        setDocs(prev => {
          const filtered = prev.filter(d => d.type !== type);
          return [uploaded, ...filtered];
        });
        setUploadProgress(100);
        success('Document Ingested & Analyzed', `${type} parsed by Multi-agent OCR.`);
      } catch (err: any) {
        error('Upload Failed', err.message || 'Validation error during ingestion.');
      } finally {
        setUploadingType(null);
        setUploadProgress(0);
      }
    }, 1100);
  };

  const simulateValidationError = (type: DocumentType) => {
    warning(
      'Document Validation Alert',
      `${type}: Password protection or corrupted digital signature detected. Re-upload clean unencrypted file.`
    );
  };

  const completedCount = REQUIRED_DOCUMENTS.filter(req =>
    docs.some(d => d.type === req.type && d.status === 'completed')
  ).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Cases' },
          { label: `Case ${caseId}`, href: `/cases/${caseId}` },
          { label: 'Document Upload & OCR Ingestion' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Document Ingestion & Multi-Agent Extraction
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900">
              {caseId}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Upload commercial underwriting dossiers. OCR agents extract tables, detect bank tampering, and compute rolling cash flows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              {completedCount} of 5 Dossiers Uploaded
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {completedCount === 5 ? 'All Ingestion Complete' : 'Pending Underwriting Intake'}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/cases/${caseId}/findings`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            disabled={completedCount === 0}
          >
            Inspect Findings
          </Button>
        </div>
      </div>

      {/* Document Ingestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REQUIRED_DOCUMENTS.map(config => {
          const doc = docs.find(d => d.type === config.type);
          const isUploading = uploadingType === config.type;
          const Icon = config.icon;

          return (
            <Card key={config.type} className="flex flex-col justify-between overflow-hidden relative">
              {/* Top Accent bar */}
              <div
                className={`h-1.5 w-full ${
                  doc ? 'bg-emerald-500' : isUploading ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />

              <CardContent className="p-5 flex-1">
                {/* Header with Icon */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        doc
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {config.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                        {config.accepted}
                      </span>
                    </div>
                  </div>

                  {doc ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  {config.description}
                </p>

                {/* Upload Status / Drag & Drop Area */}
                {isUploading ? (
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ingesting & OCR Parsing...
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <ProgressBar value={uploadProgress} color="primary" size="sm" />
                  </div>
                ) : doc ? (
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{doc.fileSize}</span>
                    </div>

                    {doc.extractedHighlights && (
                      <div className="space-y-1">
                        {doc.extractedHighlights.slice(0, 2).map((highlight, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="truncate">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/30 hover:bg-blue-50/20">
                    <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Drag & Drop or <span className="text-primary hover:underline">browse</span>
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Up to 25MB • Secure bank transmission
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(config.type, file);
                      }}
                    />
                  </label>
                )}
              </CardContent>

              {/* Card Footer Actions */}
              <CardFooter className="py-2.5 px-4 text-xs">
                {doc ? (
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="text-primary hover:text-primary-700 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View OCR Preview
                    </button>
                    <label className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer font-medium">
                      Replace
                      <input
                        type="file"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(config.type, file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-gray-400 truncate max-w-[180px]">
                      {config.recommendation}
                    </span>
                    <button
                      onClick={() => simulateValidationError(config.type)}
                      className="text-[11px] text-gray-400 hover:text-amber-600 transition-colors"
                      title="Simulate validation test"
                    >
                      Test Warning
                    </button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* File Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Document Preview & OCR Metadata</span>
          </div>
        }
        description={`Parsed details for ${previewDoc?.fileName}`}
        maxWidth="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
            Close Preview
          </Button>
        }
      >
        {previewDoc && (
          <div className="space-y-4 text-xs">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Category</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{previewDoc.type}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Size</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{previewDoc.fileSize}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Total Pages</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{previewDoc.pageCount || 24} Pages</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">AI Status</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Parsed
                </p>
              </div>
            </div>

            {/* Extracted Highlights */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                Key Agent Extractions:
              </h4>
              <div className="space-y-2">
                {previewDoc.extractedHighlights?.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Document Viewer Pane */}
            <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gray-100 dark:bg-gray-800/40 text-center space-y-2">
              <FileCheck className="w-12 h-12 text-primary mx-auto" />
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {previewDoc.fileName}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Digitally verified PDF containing electronic stamp and cryptographic signature. High OCR confidence score of 99.4%.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
