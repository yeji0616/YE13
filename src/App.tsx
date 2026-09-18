import React, { useState } from 'react';
import { HandoverProvider, useHandover } from './context/HandoverContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ChecklistEditor } from './components/ChecklistEditor';
import { ReceiverReview } from './components/ReceiverReview';
import { TemplateManager } from './components/TemplateManager';
import { ApprovalAndPdfView } from './components/ApprovalAndPdfView';
import { NewHandoverModal } from './components/NewHandoverModal';

const MainContent: React.FC = () => {
  const { activeTab } = useHandover();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>(undefined);

  const handleOpenNewModal = (templateId?: string) => {
    setPreselectedTemplateId(templateId);
    setIsNewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Header onNewHandoverClick={() => handleOpenNewModal()} />

      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard onNewHandoverClick={() => handleOpenNewModal()} />
        )}
        {activeTab === 'editor' && <ChecklistEditor />}
        {activeTab === 'review' && <ReceiverReview />}
        {activeTab === 'templates' && (
          <TemplateManager onUseTemplate={(templateId) => handleOpenNewModal(templateId)} />
        )}
        {activeTab === 'approval' && <ApprovalAndPdfView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">업무 인수인계 체크리스트</span>
            <span>· 확인 및 최종 승인</span>
          </div>
          <p className="text-slate-400">
            사내 보안 규정에 따라 중요 계정 비밀번호는 마스킹 처리되어 보관됩니다.
          </p>
        </div>
      </footer>

      {/* Global New Handover Modal */}
      <NewHandoverModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        preselectedTemplateId={preselectedTemplateId}
      />
    </div>
  );
};

export default function App() {
  return (
    <HandoverProvider>
      <MainContent />
    </HandoverProvider>
  );
}
