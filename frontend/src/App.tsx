import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewCasePage } from './pages/NewCasePage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { FindingsPage } from './pages/FindingsPage';
import { EvidenceGraphPage } from './pages/EvidenceGraphPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { CamPreviewPage } from './pages/CamPreviewPage';
import { AuditTimelinePage } from './pages/AuditTimelinePage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Underwriting Application Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cases/new" element={<NewCasePage />} />
            <Route path="/cases/:id" element={<CaseDetailsPage />} />
            <Route path="/cases/:id/documents" element={<DocumentUploadPage />} />
            <Route path="/cases/:id/findings" element={<FindingsPage />} />
            <Route path="/cases/:id/evidence" element={<EvidenceGraphPage />} />
            <Route path="/cases/:id/cam" element={<CamPreviewPage />} />
            <Route path="/cases/:id/audit" element={<AuditTimelinePage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
