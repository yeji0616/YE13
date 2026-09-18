import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { ChecklistItem, CategoryType } from '../types';
import {
  CATEGORY_META,
  PRIORITY_META,
  getDocumentStats,
  HANDOVER_STATUS_META,
} from '../utils/formatters';
import { ItemCommentDrawer } from './ItemCommentDrawer';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Paperclip,
  Calendar,
  AlertTriangle,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const ReceiverReview: React.FC = () => {
  const {
    activeDocument,
    documents,
    setActiveDocumentId,
    confirmItemByReceiver,
    unconfirmItemByReceiver,
    requestManagerApproval,
    setActiveTab,
    currentUser,
  } = useHandover();

  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [commentDrawerItem, setCommentDrawerItem] = useState<ChecklistItem | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  
  // Feedback input state for items being confirmed
  const [confirmFeedbackMap, setConfirmFeedbackMap] = useState<Record<string, string>>({});

  if (!activeDocument) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        <p>선택된 인수인계서가 없습니다.</p>
      </div>
    );
  }

  const stats = getDocumentStats(activeDocument);
  const statusMeta = HANDOVER_STATUS_META[activeDocument.status];

  const filteredItems = activeDocument.items.filter((item) => {
    return activeCategory === 'all' || item.category === activeCategory;
  });

  const togglePasswordReveal = (itemId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleConfirmItem = (item: ChecklistItem) => {
    const feedback = confirmFeedbackMap[item.id] || '내용 확인 완료 및 권한 승계 확인';
    confirmItemByReceiver(activeDocument.id, item.id, feedback);
  };

  const handleUnconfirmItem = (item: ChecklistItem) => {
    unconfirmItemByReceiver(activeDocument.id, item.id);
  };

  const allItemsConfirmed = stats.total > 0 && stats.receiverConfirmedCount === stats.total;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Info & Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={activeDocument.id}
                onChange={(e) => setActiveDocumentId(e.target.value)}
                className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-hidden"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.department})
                  </option>
                ))}
              </select>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeColor}`}
              >
                {statusMeta.label}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-600">
                인수 담당자:{' '}
                <strong className="text-emerald-700 font-bold">
                  {activeDocument.receiverName} ({activeDocument.receiverPosition})
                </strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              <span>인수 확인 및 실시간 피드백</span>
            </h2>
            <p className="text-xs text-slate-500">
              후임자 입장에서 각 항목의 절차, 권한, 첨부파일을 검증하고 '확인 완료'를 체크하세요.
              궁금한 점은 항목별 댓글을 남겨 인수인과 실시간 소통할 수 있습니다.
            </p>
          </div>

          {/* Action to request manager approval */}
          <div className="flex flex-wrap items-center gap-2">
            {activeDocument.status !== 'approved' && activeDocument.status !== 'approval_requested' && (
              <button
                onClick={() => {
                  requestManagerApproval(activeDocument.id);
                  setActiveTab('approval');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  allItemsConfirmed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>팀장 최종 승인 요청</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('approval')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1"
            >
              <span>최종 승인/PDF 보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress & Verification Meter */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-950 text-sm">인수 확인 진행률</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {stats.receiverConfirmedCount} / {stats.total} 항목 확인 완료
              </span>
            </div>
            <span className="text-sm font-extrabold text-emerald-700">
              {stats.receiverProgressRate}% 완료
            </span>
          </div>

          <div className="w-full bg-emerald-200/80 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.receiverProgressRate}%` }}
            />
          </div>

          <p className="text-[11px] text-emerald-800/90 flex items-center gap-1 mt-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {allItemsConfirmed
                ? '모든 항목의 인수가 완료되었습니다. 우측 상단의 [팀장 최종 승인 요청] 버튼을 눌러 결재를 진행하세요.'
                : `아직 확인되지 않은 항목이 ${stats.total - stats.receiverConfirmedCount}개 남아있습니다.`}
            </span>
          </p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          전체 보기 ({activeDocument.items.length})
        </button>

        {(Object.keys(CATEGORY_META) as CategoryType[]).map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const count = activeDocument.items.filter((i) => i.category === catKey).length;
          const confirmedCount = activeDocument.items.filter(
            (i) => i.category === catKey && i.status === 'receiver_confirmed'
          ).length;
          const isSelected = activeCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{meta.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {confirmedCount}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Review Checklist Stream */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const catMeta = CATEGORY_META[item.category];
          const prioMeta = PRIORITY_META[item.priority];
          const isConfirmed = item.status === 'receiver_confirmed';
          const isPasswordRevealed = revealedPasswords[item.id] || false;
          const comments = item.comments || [];
          const unreadComments = comments.filter((c) => !c.isResolved).length;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                isConfirmed
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                {/* Item Details */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {isConfirmed ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        인수 확인 완료 ({item.confirmedAt})
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                        인수자 확인 대기
                      </span>
                    )}
                    {item.isSensitive && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        보안 마스킹 계정
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </div>

                  {/* Sensitive Credential Box */}
                  {item.isSensitive && item.sensitiveCredential && (
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          계정 자격증명: {item.sensitiveCredential.accountName}
                        </span>
                        <button
                          onClick={() => togglePasswordReveal(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-[11px] font-semibold text-amber-900 flex items-center gap-1 transition-colors"
                        >
                          {isPasswordRevealed ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>마스킹 복원</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>비밀번호 잠금해제 (조회)</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200 font-mono">
                        <div>
                          <span className="text-slate-400 font-sans text-[11px] block">
                            접속 계정:
                          </span>
                          <span className="font-semibold text-slate-900 select-all">
                            {item.sensitiveCredential.loginId || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans text-[11px] block">
                            비밀번호:
                          </span>
                          <span className="font-semibold text-slate-900 select-all">
                            {isPasswordRevealed
                              ? item.sensitiveCredential.passwordMasked
                              : '••••••••••••••••'}
                          </span>
                        </div>
                      </div>

                      {item.sensitiveCredential.otpOrAccessGuide && (
                        <p className="text-[11px] text-amber-900">
                          <span className="font-semibold">OTP/보관 가이드:</span>{' '}
                          {item.sensitiveCredential.otpOrAccessGuide}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Links & Attachments */}
                  {(item.links?.length > 0 || item.attachments?.length > 0) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.links?.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          <LinkIcon className="w-3 h-3 text-emerald-600" />
                          <span>{link.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </a>
                      ))}
                      {item.attachments?.map((att) => (
                        <span
                          key={att.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg"
                        >
                          <Paperclip className="w-3 h-3 text-emerald-600" />
                          <span>{att.name}</span>
                          <span className="text-slate-400 text-[10px]">({att.size})</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Giver Notes */}
                  {item.giverNotes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">인수인 안내:</span>{' '}
                      {item.giverNotes}
                    </p>
                  )}

                  {/* Confirmed Feedback */}
                  {item.receiverFeedback && (
                    <p className="text-xs text-emerald-900 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                      <span className="font-semibold">인수자 확인 메모:</span>{' '}
                      {item.receiverFeedback}
                    </p>
                  )}
                </div>

                {/* Receiver Action Controls */}
                <div className="w-full lg:w-72 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between gap-3 shrink-0">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      인수자 검토 및 승인
                    </span>

                    {!isConfirmed ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="확인 메모 (선택: 테스트 완료 등)"
                          value={confirmFeedbackMap[item.id] || ''}
                          onChange={(e) =>
                            setConfirmFeedbackMap({
                              ...confirmFeedbackMap,
                              [item.id]: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500 bg-white"
                        />
                        <button
                          onClick={() => handleConfirmItem(item)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>내용 확인 완료 (승계)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-emerald-100/80 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>확인 완료된 항목입니다</span>
                        </div>
                        <button
                          onClick={() => handleUnconfirmItem(item)}
                          className="w-full py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                        >
                          확인 취소 (재검토)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment trigger */}
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setCommentDrawerItem(item)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        unreadComments > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>질문 / 피드백 남기기</span>
                      </div>
                      {comments.length > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            unreadComments > 0
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {comments.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <ItemCommentDrawer
        isOpen={!!commentDrawerItem}
        onClose={() => setCommentDrawerItem(null)}
        item={commentDrawerItem}
        handoverId={activeDocument.id}
      />
    </div>
  );
};
