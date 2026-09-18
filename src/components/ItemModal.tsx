import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import {
  ChecklistItem,
  CategoryType,
  Priority,
  ItemStatus,
  LinkItem,
  Attachment,
  SensitiveCredential,
} from '../types';
import { CATEGORY_META } from '../utils/formatters';
import {
  X,
  Plus,
  Trash2,
  Lock,
  Link as LinkIcon,
  Paperclip,
  Calendar,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId: string;
  initialItem?: ChecklistItem | null;
  defaultCategory?: CategoryType;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  handoverId,
  initialItem,
  defaultCategory = 'routine',
}) => {
  const { addItem, updateItem, users, activeDocument } = useHandover();

  const [category, setCategory] = useState<CategoryType>(
    initialItem?.category || defaultCategory
  );
  const [title, setTitle] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [priority, setPriority] = useState<Priority>(initialItem?.priority || 'medium');
  const [status, setStatus] = useState<ItemStatus>(initialItem?.status || 'pending');
  const [targetDate, setTargetDate] = useState(
    initialItem?.targetDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [receiverId, setReceiverId] = useState(
    initialItem?.receiverId || activeDocument?.receiverId || 'user_receiver_1'
  );
  const [giverNotes, setGiverNotes] = useState(initialItem?.giverNotes || '');

  // Links
  const [links, setLinks] = useState<LinkItem[]>(initialItem?.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>(initialItem?.attachments || []);

  // Sensitive credentials
  const [isSensitive, setIsSensitive] = useState(
    initialItem?.isSensitive || category === 'documents_accounts'
  );
  const [accountName, setAccountName] = useState(
    initialItem?.sensitiveCredential?.accountName || ''
  );
  const [loginId, setLoginId] = useState(initialItem?.sensitiveCredential?.loginId || '');
  const [passwordMasked, setPasswordMasked] = useState(
    initialItem?.sensitiveCredential?.passwordMasked || ''
  );
  const [otpOrAccessGuide, setOtpOrAccessGuide] = useState(
    initialItem?.sensitiveCredential?.otpOrAccessGuide || ''
  );
  const [credentialUrl, setCredentialUrl] = useState(
    initialItem?.sensitiveCredential?.url || ''
  );

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (!newLinkUrl) return;
    setLinks([
      ...links,
      {
        id: `link_${Date.now()}`,
        title: newLinkTitle || newLinkUrl,
        url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
      },
    ]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(links.filter((l) => l.id !== linkId));
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newAtt: Attachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        type: file.type || 'application/octet-stream',
      };
      setAttachments([...attachments, newAtt]);
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedReceiver = users.find((u) => u.id === receiverId);

    const sensitiveCredential: SensitiveCredential | undefined = isSensitive
      ? {
          accountName: accountName || title,
          loginId,
          passwordMasked,
          otpOrAccessGuide,
          url: credentialUrl,
        }
      : undefined;

    if (initialItem) {
      updateItem(handoverId, initialItem.id, {
        category,
        title,
        description,
        priority,
        status,
        targetDate,
        receiverId,
        receiverName: selectedReceiver?.name || '이지은',
        giverNotes,
        links,
        attachments,
        isSensitive,
        sensitiveCredential,
      });
    } else {
      addItem(handoverId, {
        category,
        title,
        description,
        priority,
        status,
        targetDate,
        receiverId,
        receiverName: selectedReceiver?.name || '이지은',
        giverNotes,
        links,
        attachments,
        isSensitive,
        sensitiveCredential,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {initialItem ? '인수인계 체크리스트 항목 수정' : '새 인수인계 항목 추가'}
            </h3>
            <p className="text-xs text-slate-500">
              상세 설명, 파일 첨부, 중요도 및 계정 마스킹 보안 설정
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              카테고리 선택 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_META) as CategoryType[]).map((catKey) => {
                const meta = CATEGORY_META[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => {
                      setCategory(catKey);
                      if (catKey === 'documents_accounts') {
                        setIsSensitive(true);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{meta.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{meta.enLabel}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              업무명 (인계 항목명) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 주간 배포 파이프라인 및 스테이징 롤백 절차 인계"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              상세 설명 및 인수인계 절차 <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="후임자가 단독으로 업무를 수행할 수 있도록 상세한 작업 순서, 주의사항, 예외 처리 방식을 기술하세요."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 leading-relaxed"
            />
          </div>

          {/* Priority & Target Date & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">중요도</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
              >
                <option value="high">상 (High - 핵심 업무)</option>
                <option value="medium">중 (Medium - 일반 업무)</option>
                <option value="low">하 (Low - 보조 업무)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                완료 목표일
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">담당 인수자</label>
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Status (if editing) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              작성/진행 상태
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === 'pending'
                    ? 'bg-slate-200 border-slate-400 text-slate-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                작성 대기
              </button>
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === 'in_progress'
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                정리 진행중
              </button>
              <button
                type="button"
                onClick={() => setStatus('giver_completed')}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === 'giver_completed' || status === 'receiver_confirmed'
                    ? 'bg-indigo-100 border-indigo-600 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                인수인 작성완료
              </button>
            </div>
          </div>

          {/* Sensitive Credential Box (PRD Feature) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  중요 계정 / 비밀번호 보안 마스킹
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-amber-900">보안 계정 데이터 포함</span>
              </label>
            </div>

            {isSensitive && (
              <div className="space-y-2.5 pt-2 border-t border-amber-200/60 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      계정/시스템명
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="예: AWS IAM 콘솔, Google Ads 관리자"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      접속 로그인 ID
                    </label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="예: dev-admin@techcorp.co.kr"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      비밀번호 (저장 시 자동 마스킹 처리됨)
                    </label>
                    <input
                      type="text"
                      value={passwordMasked}
                      onChange={(e) => setPasswordMasked(e.target.value)}
                      placeholder="비밀번호 입력"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      로그인 URL (선택)
                    </label>
                    <input
                      type="text"
                      value={credentialUrl}
                      onChange={(e) => setCredentialUrl(e.target.value)}
                      placeholder="https://console.aws.amazon.com"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    OTP 또는 접근/보관 가이드
                  </label>
                  <input
                    type="text"
                    value={otpOrAccessGuide}
                    onChange={(e) => setOtpOrAccessGuide(e.target.value)}
                    placeholder="예: 1Password Engineering Vault 참조 또는 물리 OTP 1호기"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white"
                  />
                </div>

                <p className="text-[10px] text-amber-800 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  저장된 비밀번호는 기본 상태에서 마스킹(••••••••)되며, 인수인/인수자/관리자 본인 인증 토글로만 조회할 수 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* Links & Attachments */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Links */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                관련 링크 및 문서 URL
              </label>

              {links.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                    >
                      <div className="truncate mr-2">
                        <span className="font-semibold text-slate-800">{link.title}:</span>{' '}
                        <span className="text-slate-500 underline">{link.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="링크 이름 (예: 사내 위키)"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-1/3 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shrink-0"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                첨부 파일 (매뉴얼, 증빙, 인수인계 자료)
              </label>

              {attachments.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                    >
                      <span className="font-medium text-slate-800">
                        📎 {att.name} <span className="text-slate-400">({att.size})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-slate-600">
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium">클릭하거나 파일을 드래그하여 첨부</span>
                <input
                  type="file"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Giver Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              인수인 메모 및 참고사항 (선택)
            </label>
            <input
              type="text"
              value={giverNotes}
              onChange={(e) => setGiverNotes(e.target.value)}
              placeholder="예: 9월 10일 대면 미팅으로 시연 완료함"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              {initialItem ? '변경사항 저장' : '항목 추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
