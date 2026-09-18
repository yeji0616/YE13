import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { CategoryType, ChecklistItem, Priority, ItemStatus } from '../types';
import {
  CATEGORY_META,
  PRIORITY_META,
  ITEM_STATUS_META,
  getDocumentStats,
  HANDOVER_STATUS_META,
} from '../utils/formatters';
import { ItemModal } from './ItemModal';
import { ItemCommentDrawer } from './ItemCommentDrawer';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Paperclip,
  Trash2,
  Edit,
  MessageSquare,
  BookmarkPlus,
  SendHorizontal,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export const ChecklistEditor: React.FC = () => {
  const {
    activeDocument,
    documents,
    setActiveDocumentId,
    deleteItem,
    updateItem,
    requestReview,
    saveAsTemplate,
    currentUser,
    setActiveTab,
  } = useHandover();

  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  
  // Drawer
  const [commentDrawerItem, setCommentDrawerItem] = useState<ChecklistItem | null>(null);

  // Sensitive passwords revealed state (keyed by itemId)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Save as template modal state
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateJobTitle, setTemplateJobTitle] = useState('');
  const [templateCategory, setTemplateCategory] = useState('개발');
  const [templateDesc, setTemplateDesc] = useState('');

  if (!activeDocument) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        <p>선택된 인수인계서가 없습니다.</p>
      </div>
    );
  }

  const stats = getDocumentStats(activeDocument);
  const statusMeta = HANDOVER_STATUS_META[activeDocument.status];

  // Filtering
  const filteredItems = activeDocument.items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesCategory && matchesPriority;
  });

  const togglePasswordReveal = (itemId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleOpenNewItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleToggleConfirm = (item: ChecklistItem) => {
    const isCurrentlyConfirmed = item.status === 'receiver_confirmed';
    if (isCurrentlyConfirmed) {
      updateItem(activeDocument.id, item.id, {
        status: 'in_progress',
        confirmedAt: undefined,
        confirmedBy: undefined,
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      updateItem(activeDocument.id, item.id, {
        status: 'receiver_confirmed',
        confirmedAt: today,
        confirmedBy: currentUser.name,
      });
    }
  };

  const handleToggleGiverComplete = (item: ChecklistItem) => {
    const nextStatus: ItemStatus =
      item.status === 'giver_completed' ? 'in_progress' : 'giver_completed';
    updateItem(activeDocument.id, item.id, { status: nextStatus });
  };

  const handleSaveAsTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateJobTitle) return;
    saveAsTemplate(
      templateJobTitle,
      templateCategory,
      templateDesc || `${templateJobTitle} 업무 표준 인수인계 템플릿`,
      activeDocument.items
    );
    setIsSaveTemplateModalOpen(false);
    alert('현재 체크리스트가 새 템플릿으로 등록되었습니다! [템플릿 관리] 탭에서 확인하세요.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar: Document selector and Status banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Top Header Row: Prominent Parties Badge & Document Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          {/* Unbroken Top Parties Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0">
            <span className="text-slate-500 font-medium">인수인:</span>
            <strong className="text-indigo-900 font-bold">{activeDocument.giverName}</strong>
            <span className="text-indigo-400 font-bold">→</span>
            <span className="text-slate-500 font-medium">인수자:</span>
            <strong className="text-emerald-800 font-bold">{activeDocument.receiverName}</strong>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">최종승인:</span>
            <strong className="text-slate-800 font-bold">{activeDocument.managerName} 팀장</strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeDocument.id}
              onChange={(e) => setActiveDocumentId(e.target.value)}
              className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.department})
                </option>
              ))}
            </select>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${statusMeta.badgeColor}`}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Title and actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500">
              {activeDocument.department} · {activeDocument.jobRole} 직무
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug break-keep">
              {activeDocument.title}
            </h2>
          </div>

          {/* Action buttons on header */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setTemplateJobTitle(activeDocument.jobRole);
                setTemplateDesc(`${activeDocument.jobRole} 업무 인수인계 표준 템플릿`);
                setIsSaveTemplateModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BookmarkPlus className="w-4 h-4 text-indigo-600" />
              <span>템플릿으로 저장</span>
            </button>

            <button
              onClick={() => setActiveTab('approval')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>인수인계서 보기</span>
            </button>
          </div>
        </div>

        {/* Approver Status Card & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* Final Approver Box */}
          <div className="lg:col-span-2 p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase whitespace-nowrap">
                    최종 승인자
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                      activeDocument.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    }`}
                  >
                    {activeDocument.status === 'approved' ? '최종 승인 완료 ✓' : '승인 대기 중'}
                  </span>
                </div>
                <p className="text-base font-extrabold text-white">
                  {activeDocument.managerName || '박성훈'} 팀장 ({activeDocument.department})
                </p>
                <p className="text-xs text-slate-300">
                  {activeDocument.status === 'approved'
                    ? `전자서명 결재가 승인되었습니다 (${activeDocument.approvedAt})`
                    : '체크리스트 확인 완료 후 최종 승인 결재를 진행합니다.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('approval')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>인수인계서 결재</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Checklist Verification Progress */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                체크리스트 확인 완료율
              </span>
              <span className="font-extrabold text-emerald-800 text-sm">
                {stats.receiverProgressRate}%
              </span>
            </div>

            <div className="w-full bg-emerald-200/80 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.receiverProgressRate}%` }}
              />
            </div>

            <p className="text-[11px] text-emerald-700 font-medium text-right whitespace-nowrap">
              총 {stats.total}개 항목 중 <strong>{stats.receiverConfirmedCount}개</strong> 확인 완료
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs & Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            전체 항목 ({activeDocument.items.length})
          </button>

          {(Object.keys(CATEGORY_META) as CategoryType[]).map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const count = activeDocument.items.filter((i) => i.category === catKey).length;
            const isSelected = activeCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{meta.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Toolbar: Priority filter & Add button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-hidden"
            >
              <option value="all">모든 중요도</option>
              <option value="high">중요도 상 (High)</option>
              <option value="medium">중요도 중 (Medium)</option>
              <option value="low">중요도 하 (Low)</option>
            </select>
          </div>

          <button
            onClick={handleOpenNewItem}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>항목 추가</span>
          </button>
        </div>
      </div>

      {/* Checklist Items Stream */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">등록된 체크리스트 항목이 없습니다.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              [항목 추가] 버튼을 눌러 정기 업무, 진행 프로젝트, 중요 계정 등을 등록하세요.
            </p>
            <button
              onClick={handleOpenNewItem}
              className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              첫 항목 등록하기
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const catMeta = CATEGORY_META[item.category];
            const prioMeta = PRIORITY_META[item.priority];
            const statusItemMeta = ITEM_STATUS_META[item.status];
            const isGiverDone =
              item.status === 'giver_completed' || item.status === 'receiver_confirmed';
            const isReceiverDone = item.status === 'receiver_confirmed';
            const isPasswordRevealed = revealedPasswords[item.id] || false;
            const comments = item.comments || [];
            const unreadComments = comments.filter((c) => !c.isResolved).length;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:border-slate-300 ${
                  isReceiverDone
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isGiverDone
                    ? 'border-indigo-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Checkbox & Main Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleConfirm(item)}
                      className={`mt-1 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isReceiverDone
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white text-transparent'
                      }`}
                      title={isReceiverDone ? '확인 취소 (미확인 상태로 변경)' : '확인 완료로 체크하기'}
                    >
                      <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                    </button>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isReceiverDone ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 whitespace-nowrap shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>확인 완료 ({item.confirmedBy || '인수자'} · {item.confirmedAt || '오늘'})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">
                            미확인
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeColor}`}
                        >
                          {catMeta.label}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${prioMeta.badgeColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prioMeta.dotColor}`} />
                          {prioMeta.label}
                        </span>
                        {item.isSensitive && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            보안 마스킹 계정
                          </span>
                        )}
                        <span className="text-xs text-slate-400">· 기한: {item.targetDate}</span>
                      </div>

                      <h4
                        className={`text-base font-bold text-slate-900 leading-snug ${
                          isGiverDone ? 'text-slate-800' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>

                      {/* Sensitive Credential Box */}
                      {item.isSensitive && item.sensitiveCredential && (
                        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-amber-700" />
                              보안 계정 정보: {item.sensitiveCredential.accountName}
                            </span>
                            <button
                              onClick={() => togglePasswordReveal(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-[11px] font-semibold text-amber-900 flex items-center gap-1 transition-colors"
                            >
                              {isPasswordRevealed ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>비밀번호 숨김 (마스킹)</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>비밀번호 열람 (확인)</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 bg-white/70 p-2.5 rounded-lg border border-amber-200/60 font-mono">
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">
                                로그인 계정:
                              </span>
                              <span className="font-semibold text-slate-800 select-all">
                                {item.sensitiveCredential.loginId || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">
                                비밀번호:
                              </span>
                              <span className="font-semibold text-slate-800 select-all">
                                {isPasswordRevealed
                                  ? item.sensitiveCredential.passwordMasked
                                  : '••••••••••••••••'}
                              </span>
                            </div>
                          </div>

                          {item.sensitiveCredential.otpOrAccessGuide && (
                            <p className="text-[11px] text-amber-800">
                              <span className="font-semibold">OTP/보관 안내:</span>{' '}
                              {item.sensitiveCredential.otpOrAccessGuide}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Links & Attachments list */}
                      {(item.links?.length > 0 || item.attachments?.length > 0) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                          {item.links?.map((link) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            >
                              <LinkIcon className="w-3 h-3 text-indigo-600" />
                              <span>{link.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                            </a>
                          ))}

                          {item.attachments?.map((att) => (
                            <span
                              key={att.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg"
                            >
                              <Paperclip className="w-3 h-3 text-indigo-600" />
                              <span>{att.name}</span>
                              <span className="text-slate-400 text-[10px]">({att.size})</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Giver Notes & Receiver Feedback */}
                      {item.giverNotes && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700">인수인 메모:</span>{' '}
                          {item.giverNotes}
                        </p>
                      )}

                      {item.receiverFeedback && (
                        <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          <span className="font-semibold text-emerald-900">인수자 확인 피드백:</span>{' '}
                          {item.receiverFeedback} ({item.confirmedAt})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Comment Button */}
                  <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Primary Confirmation Click Button */}
                    <button
                      onClick={() => handleToggleConfirm(item)}
                      className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 ${
                        isReceiverDone
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                          : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-300 hover:border-emerald-600'
                      }`}
                      title={isReceiverDone ? '클릭 시 확인 취소' : '확인 완료로 표시'}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{isReceiverDone ? '확인 완료 ✓' : '확인했으면 클릭'}</span>
                    </button>

                    <button
                      onClick={() => setCommentDrawerItem(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        unreadComments > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : comments.length > 0
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>댓글</span>
                      {comments.length > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            unreadComments > 0
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-300 text-slate-800'
                          }`}
                        >
                          {comments.length}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="수정하기"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`'${item.title}' 항목을 삭제하시겠습니까?`)) {
                            deleteItem(activeDocument.id, item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="삭제하기"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Item Create/Edit Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        handoverId={activeDocument.id}
        initialItem={editingItem}
        defaultCategory={activeCategory !== 'all' ? activeCategory : 'routine'}
      />

      {/* Item Comments Drawer */}
      <ItemCommentDrawer
        isOpen={!!commentDrawerItem}
        onClose={() => setCommentDrawerItem(null)}
        item={commentDrawerItem}
        handoverId={activeDocument.id}
      />

      {/* Save As Template Modal */}
      {isSaveTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-indigo-600" />
              현재 체크리스트를 템플릿으로 저장
            </h3>
            <p className="text-xs text-slate-500">
              현재 인수인계서의 {activeDocument.items.length}개 항목 구조를 사내 공유 템플릿으로 등록합니다.
            </p>

            <form onSubmit={handleSaveAsTemplateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  템플릿 직무명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateJobTitle}
                  onChange={(e) => setTemplateJobTitle(e.target.value)}
                  placeholder="예: 플랫폼 프론트엔드 개발자"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">직무 카테고리</label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="개발">개발 (Engineering)</option>
                  <option value="마케팅">마케팅 (Marketing)</option>
                  <option value="인사/HR">인사/HR (People & Culture)</option>
                  <option value="재무/회계">재무/회계 (Finance)</option>
                  <option value="기획/디자인">기획/디자인 (Product & Design)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">템플릿 설명</label>
                <textarea
                  rows={2}
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="이 템플릿에 포함된 주요 업무와 사용 목적을 기술하세요."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  템플릿 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
