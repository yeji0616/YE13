import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { JobTemplate, CategoryType, Priority } from '../types';
import { CATEGORY_META, PRIORITY_META } from '../utils/formatters';
import {
  FileSpreadsheet,
  Layers,
  Sparkles,
  Plus,
  ArrowRight,
  Lock,
  CheckCircle,
  Eye,
  BookmarkCheck,
  Shield,
  X,
} from 'lucide-react';

interface TemplateManagerProps {
  onUseTemplate: (templateId: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onUseTemplate }) => {
  const { templates, saveAsTemplate } = useHandover();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [inspectingTemplate, setInspectingTemplate] = useState<JobTemplate | null>(null);

  // New Template Modal state
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('개발');
  const [newDesc, setNewDesc] = useState('');
  const [templateItems, setTemplateItems] = useState<
    Array<{
      category: CategoryType;
      title: string;
      description: string;
      priority: Priority;
      isSensitive: boolean;
    }>
  >([
    {
      category: 'routine',
      title: '주간 정기 업무 및 보고 프로세스',
      description: '정기 주간 회의 준비 및 부서간 현황 보고',
      priority: 'high',
      isSensitive: false,
    },
    {
      category: 'documents_accounts',
      title: '공용 관리자 계정 및 비밀번호 인계',
      description: '시스템 관리자 권한 및 계정 로그인 가이드',
      priority: 'high',
      isSensitive: true,
    },
  ]);

  const categories = ['전체', '개발', '마케팅', '인사/HR', '재무/회계'];

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === '전체') return true;
    return t.category === selectedCategory;
  });

  const handleAddTemplateItem = () => {
    setTemplateItems([
      ...templateItems,
      {
        category: 'routine',
        title: '',
        description: '',
        priority: 'medium',
        isSensitive: false,
      },
    ]);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    // Convert to ChecklistItem-like structure for saving
    const mockItems = templateItems
      .filter((i) => i.title.trim() !== '')
      .map((i, idx) => ({
        id: `tpl_it_${Date.now()}_${idx}`,
        handoverId: '',
        category: i.category,
        title: i.title,
        description: i.description,
        priority: i.priority,
        status: 'pending' as const,
        targetDate: '',
        links: [],
        attachments: [],
        receiverId: '',
        receiverName: '',
        isSensitive: i.isSensitive,
        comments: [],
      }));

    saveAsTemplate(newTitle, newCategory, newDesc, mockItems);
    setIsNewTemplateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>표준화된 직무별 체크리스트 라이브러리</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            인수인계 템플릿 관리
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            개발, 마케팅, 인사, 재무 등 직무별 필수 인수인계 표준 템플릿을 확인하고,
            우리 팀만의 사용자 정의 템플릿을 생성하여 사내 전파할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => setIsNewTemplateModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>신규 템플릿 등록</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {template.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {template.isStandard ? '사내 표준 템플릿' : '사용자 정의 템플릿'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{template.jobTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Items Preview List */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  포함 항목 ({template.items.length}개)
                </span>
                <div className="space-y-1.5">
                  {template.items.slice(0, 4).map((item, idx) => {
                    const catMeta = CATEGORY_META[item.category];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
                      >
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${catMeta.badgeColor}`}>
                          {catMeta.label}
                        </span>
                        <span className="truncate flex-1 font-medium">{item.title}</span>
                        {item.isSensitive && (
                          <span title="보안 계정">
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {template.items.length > 4 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">
                      외 {template.items.length - 4}개 항목 더보기...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setInspectingTemplate(template)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>항목 전체 미리보기</span>
              </button>

              <button
                onClick={() => onUseTemplate(template.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>이 템플릿으로 시작</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspect Template Modal */}
      {inspectingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {inspectingTemplate.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {inspectingTemplate.jobTitle} 템플릿 상세
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  총 {inspectingTemplate.items.length}개 사전 구성된 표준 인계 항목
                </p>
              </div>
              <button
                onClick={() => setInspectingTemplate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {inspectingTemplate.items.map((item, idx) => {
                const catMeta = CATEGORY_META[item.category];
                const prioMeta = PRIORITY_META[item.priority];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catMeta.badgeColor}`}>
                        {catMeta.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${prioMeta.badgeColor}`}>
                        {prioMeta.label}
                      </span>
                      {item.isSensitive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          계정 보안 마스킹
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">{item.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setInspectingTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  const id = inspectingTemplate.id;
                  setInspectingTemplate(null);
                  onUseTemplate(id);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                이 템플릿으로 인수인계서 작성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Template Creation Modal */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">신규 표준 템플릿 등록</h3>
                <p className="text-xs text-slate-500">
                  사내 다른 구성원들이 활용할 수 있도록 직무 표준 체크리스트를 만듭니다.
                </p>
              </div>
              <button
                onClick={() => setIsNewTemplateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    직무명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 데이터 분석가 (Data Analyst)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="개발">개발</option>
                    <option value="마케팅">마케팅</option>
                    <option value="인사/HR">인사/HR</option>
                    <option value="재무/회계">재무/회계</option>
                    <option value="기획/디자인">기획/디자인</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">템플릿 설명</label>
                <input
                  type="text"
                  placeholder="예: SQL 쿼리, BI 대시보드 및 데이터 파이프라인 인수인계"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">체크리스트 사전 정의 항목</label>
                  <button
                    type="button"
                    onClick={handleAddTemplateItem}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    항목 추가
                  </button>
                </div>

                <div className="space-y-3">
                  {templateItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const next = [...templateItems];
                            next[idx].category = e.target.value as CategoryType;
                            setTemplateItems(next);
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-medium"
                        >
                          <option value="routine">정기 업무</option>
                          <option value="projects">진행 중 프로젝트</option>
                          <option value="documents_accounts">중요 문서/계정</option>
                          <option value="contacts">외부 연락처</option>
                        </select>

                        <input
                          type="text"
                          required
                          placeholder="항목 제목"
                          value={item.title}
                          onChange={(e) => {
                            const next = [...templateItems];
                            next[idx].title = e.target.value;
                            setTemplateItems(next);
                          }}
                          className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                        />

                        <label className="flex items-center gap-1 text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isSensitive}
                            onChange={(e) => {
                              const next = [...templateItems];
                              next[idx].isSensitive = e.target.checked;
                              setTemplateItems(next);
                            }}
                            className="rounded text-indigo-600"
                          />
                          <span>보안계정</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="상세 설명 / 작업 절차 요약"
                        value={item.description}
                        onChange={(e) => {
                          const next = [...templateItems];
                          next[idx].description = e.target.value;
                          setTemplateItems(next);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  템플릿 저장 및 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
