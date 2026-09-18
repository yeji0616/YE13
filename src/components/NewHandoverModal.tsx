import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { X, Sparkles, FileText, Calendar, Building2, User, UserCheck, Shield } from 'lucide-react';

interface NewHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTemplateId?: string;
}

export const NewHandoverModal: React.FC<NewHandoverModalProps> = ({
  isOpen,
  onClose,
  preselectedTemplateId,
}) => {
  const { templates, currentUser, users, createHandoverDocument } = useHandover();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || 'template_dev'
  );
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(currentUser.department || '플랫폼기획팀');
  const [jobRole, setJobRole] = useState(currentUser.position || '플랫폼 기획자');
  const [receiverId, setReceiverId] = useState('user_receiver_1');
  const [managerId, setManagerId] = useState('user_manager_1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && !title) {
      setTitle(`${tmpl.jobTitle} 업무 인수인계서`);
      setDepartment(
        tmpl.category === '개발' || tmpl.category === '기획'
          ? '플랫폼기획팀'
          : '서비스기획·마케팅팀'
      );
      setJobRole(tmpl.jobTitle);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedReceiver = users.find((u) => u.id === receiverId);
    const selectedManager = users.find((u) => u.id === managerId);

    createHandoverDocument(
      {
        title: title || `${jobRole} 업무 인수인계서`,
        department,
        jobRole,
        receiverId: selectedReceiver?.id || receiverId,
        receiverName: selectedReceiver?.name || '이지은',
        receiverPosition: selectedReceiver?.position || '주임',
        receiverEmail: selectedReceiver?.email || 'jieun.lee@techcorp.co.kr',
        managerId: selectedManager?.id || managerId,
        managerName: selectedManager?.name || '박성훈',
        managerPosition: selectedManager?.position || '팀장',
        managerEmail: selectedManager?.email || 'sh.park@techcorp.co.kr',
        startDate,
        dueDate,
      },
      selectedTemplateId !== 'scratch' ? selectedTemplateId : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">새 인수인계서 작성</h3>
              <p className="text-xs text-slate-500">표준 직무 템플릿 적용 및 인수인/인수자 배정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Template selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                1. 직무별 표준 템플릿 선택
              </label>
              <span className="text-xs text-slate-400">카테고리별 필수 항목이 자동 생성됩니다</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templates.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateId === tmpl.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{tmpl.jobTitle}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tmpl.category} ({tmpl.itemCount}개 항목)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedTemplateId('scratch')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedTemplateId === 'scratch'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">직접 빈 양식으로 시작</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    사용자 정의
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  사전 구성된 항목 없이 필요한 체크리스트를 하나씩 직접 추가합니다.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Basic Info */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              2. 인수인계 기본 정보
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                인수인계서 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 플랫폼 프론트엔드 서비스 및 디자인 시스템 인수인계서"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">소속 부서</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">인계 직무명</label>
                <input
                  type="text"
                  required
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="예: 시니어 프론트엔드 개발자"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Parties: Giver (readonly), Receiver, Manager */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  인수인 (작성자)
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500">({currentUser.position})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  인수자 (후임자) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department} · {u.position})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  관리자 (팀장/HR) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  {users
                    .filter((u) => u.role === 'manager' || u.id === 'user_manager_1')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department} · {u.position})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">인계 시작일</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  최종 인수인계 완료 목표일
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              인수인계서 생성 및 작성 시작
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
